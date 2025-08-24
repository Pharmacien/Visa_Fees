"use client";

import { useRef, useState, useEffect } from "react";
import { Application } from "@/lib/schema";
import { Button } from "./ui/button";
import { Download, FileText, Printer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "./ui/card";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { format } from "date-fns";

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
        format: [canvas.width, canvas.height]
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`visa-receipt-${application.passportNumber}.pdf`);
    });
  };

  return (
    <div className="bg-muted min-h-screen p-4 sm:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <Card className="mb-8 no-print shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline">Application Receipt</CardTitle>
                <CardDescription>Actions for receipt of {application.fullName}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
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
        
        <div ref={receiptRef} className="bg-white p-12 shadow-2xl rounded-lg">
          <header className="flex justify-between items-start pb-8 border-b-2 border-primary">
            <div>
              <h1 className="text-4xl font-bold text-primary font-headline">Visa Application Fees Receipt</h1>
              <p className="text-muted-foreground mt-1">The Embassy of Algeria in Slovenia</p>
            </div>
            <div className="text-primary">
                <FileText size={48} />
            </div>
          </header>

          <section className="my-12 text-lg leading-relaxed">
            <p>
              The Embassy of Algeria in Slovenia states that we have received {' '}
              <span className="font-semibold">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(application.amountPaid)}
              </span> from <span className="font-semibold">{application.fullName}</span> on {' '}
              <span className="font-semibold">{format(new Date(application.applicationDate), "PPP")}</span>,
              corresponding to the chancery rights of the Visa Application Fees.
            </p>
          </section>

          <div className="mt-24 space-y-12">
              <div>
                  <p>Place and date: ___________________________</p>
              </div>
              <div>
                  <p>Signature: ________________________________</p>
              </div>
          </div>

          <footer className="mt-12 pt-8 border-t text-center text-muted-foreground text-sm">
            <p className="font-bold font-headline text-primary">VisaForm.AI</p>
            <p>This is an automatically generated receipt. Please keep it for your records.</p>
            {generatedDate && <p>Generated on: {generatedDate.toLocaleString()}</p>}
          </footer>
        </div>
      </div>
    </div>
  );
}
