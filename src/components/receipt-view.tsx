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


export function ReceiptView({ application }: { application: Application }) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [generatedDate, setGeneratedDate] = useState<Date | null>(null);

  useEffect(() => {
    setGeneratedDate(new Date());
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
        
        <div ref={receiptRef} className="bg-white p-12 shadow-lg rounded-sm text-black">
          <header className="flex justify-between items-start pb-4">
            <div className="flex items-center gap-4">
              <Image 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Seal_of_Algeria.svg/2048px-Seal_of_Algeria.svg.png"
                alt="Seal of Algeria"
                width={80}
                height={80}
                data-ai-hint="algeria seal"
              />
              <span className="text-lg font-semibold">People's Democratic Republic of Algeria</span>
            </div>
            <div className="text-right">
                <h2 className="text-2xl font-bold">Receipt</h2>
                <p className="mt-2">No. __________</p>
                <p className="mt-1">Date: <span className="font-sans">{generatedDate ? format(generatedDate, 'PP') : '__________'}</span></p>
            </div>
          </header>

          <section className="text-center my-8">
            <h1 className="text-2xl font-bold underline tracking-wide">PAYMENT RECEIPT</h1>
          </section>

          <section className="grid grid-cols-2 gap-8 border border-black p-4">
            <div>
              <p className="font-bold">Received from:</p>
              <p className="mt-4">Name and Surname: <span className="font-sans font-semibold">{application.fullName}</span></p>
              <p className="mt-2">Document No.: <span className="font-sans font-semibold">{application.passportNumber}</span></p>
              <p className="mt-2">Address: _________________________</p>
            </div>
            <div>
              <p className="font-bold">Issued by:</p>
              <div className="mt-4 font-sans">
                  <p>Embassy of Algeria in Slovenia</p>
                  <p>Opekarska cesta 35, 1000 Ljubljana</p>
                  <p>Tel: 083 83 1700</p>
              </div>
            </div>
          </section>
          
          <section className="mt-4">
            <table className="w-full border-collapse border border-black">
                <thead>
                    <tr className="border-b border-black">
                        <th className="p-2 text-left font-bold border-r border-black">Description</th>
                        <th className="p-2 text-left font-bold">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="p-2 border-r border-black font-sans">Visa Application Fee</td>
                        <td className="p-2 font-sans font-semibold">
                            {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "USD",
                                }).format(application.amountPaid)
                            }
                        </td>
                    </tr>
                    <tr>
                        <td className="p-2 border-r border-black h-16"></td>
                        <td className="p-2"></td>
                    </tr>
                </tbody>
            </table>
          </section>

          <footer className="mt-24 text-right">
            <p>Stamp and Signature: ____________________</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
