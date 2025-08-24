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

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-8 flex flex-col items-center">
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
        
        <div ref={receiptRef} className="bg-white p-12 shadow-lg rounded-sm text-black A4-format font-sans">
          {/* Header */}
          <header className="text-center mb-8 relative">
            <div className="absolute top-0 right-0 text-left">
                <h2 className="font-bold">Receipt</h2>
                <p className="mt-1">No. <span className="font-normal underline">{receiptNumber}</span></p>
                <p className="mt-1">Date: <span className="font-normal underline">{generatedDate ? format(generatedDate, 'dd.MM.yyyy') : '__________'}</span></p>
            </div>
             <div className="flex justify-center mb-2">
                 <Image 
                    src="https://upload.wikimedia.org/wikipedia/commons/e/e8/Seal_of_Algeria.svg"
                    alt="Seal of Algeria"
                    width={80}
                    height={80}
                    data-ai-hint="algeria seal"
                />
            </div>
            <p className="font-semibold">People's Democratic Republic of Algeria</p>
          </header>

          {/* Title */}
          <section className="text-center my-10">
            <h1 className="text-2xl font-bold underline tracking-wider">Payment Receipt</h1>
          </section>

          {/* Info Boxes */}
          <section className="grid grid-cols-2 gap-4 my-8 text-sm">
            <div className="border p-4">
                <p className="text-xs mb-4">Received from:</p>
                <p className="mt-2"><strong>Name and Surname:</strong> {application.fullName}</p>
                <p className="mt-2"><strong>Document No.</strong> {application.passportNumber}</p>
                <p className="mt-2"><strong>Address:</strong> {application.address}</p>
            </div>
            <div className="border p-4">
                <p className="text-xs mb-4">Issued by:</p>
                <p className="mt-2"><strong>Embassy of Algeria in Slovenia</strong></p>
                <p className="mt-2">Opekarska cesta 35, 1000 Ljubljana</p>
                <p className="mt-2">Tel: 083 83 1700</p>
            </div>
          </section>

          {/* Fees Table */}
          <section className="my-8">
            <table className="w-full border-collapse border text-sm">
                <thead>
                    <tr className="border-b">
                        <th className="p-2 text-left font-bold border-r">Description</th>
                        <th className="p-2 text-left font-bold">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="p-2 border-r h-16">Visa Application Fee</td>
                        <td className="p-2">{new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(application.amountPaid)}</td>
                    </tr>
                     <tr>
                        <td className="p-2 border-r h-16"></td>
                        <td className="p-2"></td>
                    </tr>
                </tbody>
            </table>
          </section>
          
          
          {/* Footer */}
          <footer className="mt-24">
            <div className="flex justify-end">
                <div className="text-left">
                    <p>Stamp and Signature:</p>
                    <p className="mt-16">________________________________</p>
                </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
