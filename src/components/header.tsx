import { FileText } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex items-center">
            <FileText className="h-6 w-6 text-primary" />
            <span className="ml-2 font-bold font-headline">VisaForm.AI</span>
        </div>
      </div>
    </header>
  );
}
