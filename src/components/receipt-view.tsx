"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Application } from "@/lib/schema";
import { Button } from "./ui/button";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

// This is a simple in-memory counter for the session.
// It will reset on page refresh. For a persistent, global counter,
// a database or server-side state management would be needed.
let receiptCounter = 0;

export function ReceiptView({ application }: { application: Application }) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [generatedDate, setGeneratedDate] = useState<Date | null>(null);
  const [receiptNumber, setReceiptNumber] = useState<string>('');

  useEffect(() => {
    const now = new Date();
    setGeneratedDate(now);
    
    // Increment the counter for each new receipt generated in the session
    receiptCounter += 1;
    const formattedCounter = String(receiptCounter).padStart(2, '0');
    setReceiptNumber(`VISA${formattedCounter}/${now.getFullYear()}`);
  }, []);


  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!receiptRef.current) return;

    html2canvas(receiptRef.current, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4"
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`visa-receipt-${application.passportNumber}.pdf`);
    });
  };

  return (
    <>
      <div className="bg-gray-100 min-h-screen p-4 sm:p-8 flex flex-col items-center print:bg-white print:p-0">
        <div className="w-full max-w-4xl print:max-w-none print:w-auto">
          <Card className="mb-8 no-print shadow-lg">
              <CardHeader>
                  <CardTitle className="font-headline">Application Receipt</CardTitle>
                  <CardDescription>Actions for receipt of {application.fullName}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                  <Button asChild variant="outline">
                      <Link href="/">
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back to Dashboard
                      </Link>
                  </Button>
                  <Button onClick={handlePrint}>
                      <Printer className="mr-2 h-4 w-4" />
                      Print
                  </Button>
                  <Button onClick={handleDownload} variant="secondary">
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                  </Button>
              </CardContent>
          </Card>
          
          <div ref={receiptRef} className="bg-white p-[1in] shadow-lg rounded-sm text-black A4-format font-sans print:shadow-none print:rounded-none">
            {/* Header */}
            <header className="flex justify-between items-start mb-10">
              <div className="text-sm">
                <h2 className="font-bold text-lg mb-2">Embassy of Algeria in Slovenia</h2>
                <p>Opekarska cesta 35</p>
                <p>1000 Ljubljana</p>
                <p>Tel: 083 83 1700</p>
              </div>
              <div className="relative w-24 h-24">
                <Image
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Emblem_of_Algeria.svg/2048px-Emblem_of_Algeria.svg.png"
                  alt="Seal of Algeria"
                  layout="fill"
                  objectFit="contain"
                  data-ai-hint="algeria seal"
                />
              </div>
            </header>
            
            {/* Title */}
            <section className="text-center my-10">
              <h1 className="text-2xl font-bold underline tracking-wider">PAYMENT RECEIPT</h1>
            </section>

            {/* Meta Info */}
            <section className="grid grid-cols-2 gap-x-8 text-sm mb-8">
              <div>
                <div className="grid grid-cols-2">
                  <span className="font-bold">Receipt No:</span>
                  <span>{receiptNumber}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="grid grid-cols-2">
                  <span className="font-bold">Date:</span>
                  <span>{generatedDate ? format(generatedDate, 'dd.MM.yyyy') : '...'}</span>
                </div>
              </div>
            </section>

            {/* Main Content */}
            <section className="border-t border-b border-black py-4 my-8">
              <div className="grid grid-cols-[1fr_2fr] gap-x-4 text-sm leading-relaxed">
                  <span className="font-bold">Received from:</span>
                  <span>{application.fullName}</span>

                  <span className="font-bold">Address:</span>
                  <span>{application.address}</span>

                  <span className="font-bold">Passport No:</span>
                  <span>{application.passportNumber}</span>
              </div>
            </section>
            
            {/* Fees Table */}
            <section className="my-8">
              <table className="w-full border-collapse border border-black text-sm">
                  <thead>
                      <tr className="border-b border-black">
                          <th className="p-2 text-left font-bold border-r border-black">Description</th>
                          <th className="p-2 text-right font-bold">Amount</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr>
                          <td className="p-2 border-r border-black">Visa Application Fee</td>
                          <td className="p-2 text-right">{new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(application.amountPaid)}</td>
                      </tr>
                  </tbody>
                  <tfoot>
                      <tr className="border-t-2 border-black font-bold">
                          <td className="p-2 text-right border-r border-black">Total</td>
                          <td className="p-2 text-right">{new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(application.amountPaid)}</td>
                      </tr>
                  </tfoot>
              </table>
            </section>

            {/* Footer */}
            <footer className="mt-20 text-center text-xs">
              <div className="w-48 mx-auto">
                <div className="border-t border-black pt-2">
                  <p>Signature</p>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </>
  );
}
