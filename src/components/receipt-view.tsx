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
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const canvasAspectRatio = canvasWidth / canvasHeight;
      const pdfAspectRatio = pdfWidth / pdfHeight;
      
      let finalWidth, finalHeight;

      if (canvasAspectRatio > pdfAspectRatio) {
        finalWidth = pdfWidth;
        finalHeight = pdfWidth / canvasAspectRatio;
      } else {
        finalHeight = pdfHeight;
        finalWidth = pdfHeight * canvasAspectRatio;
      }
      
      const x = (pdfWidth - finalWidth) / 2;
      const y = (pdfHeight - finalHeight) / 2;
      
      pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight);
      pdf.save(`visa-receipt-${application.passportNumber}.pdf`);
    });
  };
  
  const zonedApplicationDate = toZonedTime(new Date(application.applicationDate), 'UTC');

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-8 flex flex-col items-center font-serif">
      <div className="w-full max-w-4xl">
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
        
        <div ref={receiptRef} className="bg-white p-12 shadow-lg rounded-sm text-black A4-format">
          {/* Header */}
          <header className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-4">
              <Image 
                src="https://upload.wikimedia.org/wikipedia/commons/e/e8/Seal_of_Algeria.svg"
                alt="Seal of Algeria"
                width={60}
                height={60}
                data-ai-hint="algeria seal"
              />
              <p className="font-bold">People's Democratic Republic of Algeria</p>
            </div>
            <div className="text-left">
                <h2 className="text-xl font-bold">Receipt</h2>
                <p className="mt-1">No. <span className="font-sans font-normal underline">{receiptNumber}</span></p>
                <p className="mt-1">Date: <span className="font-sans font-normal underline">{generatedDate ? format(generatedDate, 'dd.MM.yyyy') : '__________'}</span></p>
            </div>
          </header>

          {/* Title */}
          <section className="text-center my-8">
            <h1 className="text-xl font-bold underline tracking-wide">Payment Receipt</h1>
          </section>

          {/* Info Boxes */}
          <section className="grid grid-cols-2 gap-4 my-8 text-sm">
            <div className="border p-4">
              <p className="font-bold mb-2">Received from:</p>
              <p>Name and Surname: <span className="font-semibold">{application.fullName}</span></p>
              <p>Document No.: <span className="font-sans font-semibold">{application.passportNumber}</span></p>
              <p>Address: <span className="font-semibold">{application.address}</span></p>
            </div>
            <div className="border p-4">
              <p className="font-bold mb-2">Issued by:</p>
              <p className="font-semibold">Embassy of Algeria in Slovenia</p>
              <p>Opekarska cesta 35, 1000 Ljubljana</p>
              <p>Tel: 083 83 1700</p>
            </div>
          </section>
          
          {/* Details Table */}
          <section className="my-8">
            <table className="w-full border-collapse border border-black">
              <thead>
                <tr>
                  <th className="border border-black p-2 text-left font-bold">Description</th>
                  <th className="border border-black p-2 text-left font-bold w-48">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-2">Visa Application Fee</td>
                  <td className="border border-black p-2 font-sans font-bold text-center">€{application.amountPaid.toFixed(2)}</td>
                </tr>
                 <tr>
                  <td className="border border-black p-2 h-12"></td>
                  <td className="border border-black p-2 h-12"></td>
                </tr>
              </tbody>
            </table>
          </section>


          {/* Footer */}
          <footer className="mt-24">
            <div className="flex justify-end">
                <p>Stamp and Signature: ________________________________</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
