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
  const [receiptNumber, setReceiptNumber] = useState<string>('');

  useEffect(() => {
    const now = new Date();
    setGeneratedDate(now);
    // Generate a random 4-digit number for the receipt
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    setReceiptNumber(`VISA${randomNumber}/${now.getFullYear()}`);
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
          <header className="flex justify-between items-start pb-4 border-b-2 border-black">
            <div className="flex items-center gap-4">
              <Image 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Seal_of_Algeria.svg/2048px-Seal_of_Algeria.svg.png"
                alt="Seal of Algeria"
                width={80}
                height={80}
                data-ai-hint="algeria seal"
              />
               <div className="text-center">
                  <p className="font-bold">PEOPLE'S DEMOCRATIC REPUBLIC OF ALGERIA</p>
                  <p>EMBASSY OF ALGERIA IN SLOVENIA</p>
                </div>
            </div>
            <div className="text-right">
                <h2 className="text-xl font-bold">Receipt Number: <span className="font-sans">{receiptNumber}</span></h2>
                <p className="mt-1">Date: <span className="font-sans">{generatedDate ? format(generatedDate, 'dd.MM.yyyy') : '__________'}</span></p>
            </div>
          </header>

          <section className="text-center my-8">
            <h1 className="text-2xl font-bold underline tracking-wide">PAYMENT RECEIPT</h1>
          </section>
          
          <section className="my-8 text-lg">
             <p className="leading-relaxed">
                The Embassy of Algeria in Slovenia states that we have received{' '}
                <span className="font-bold font-sans">${application.amountPaid}</span> from{' '}
                <span className="font-bold">{application.fullName}</span> on{' '}
                <span className="font-bold font-sans">{format(zonedApplicationDate, "dd.MM.yyyy")}</span>,
                corresponding to the chancery rights of the Visa Application Fees.
            </p>
          </section>

          <footer className="mt-24">
            <div className="flex justify-between">
                <p>Place and date: ___________________________</p>
                <p>Signature: ________________________________</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
