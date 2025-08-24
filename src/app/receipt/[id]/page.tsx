import { getApplicationById } from "@/app/actions";
import { ReceiptView } from "@/components/receipt-view";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type ReceiptPageProps = {
  params: {
    id: string;
  };
};

export default async function ReceiptPage({ params }: ReceiptPageProps) {
  const application = await getApplicationById(params.id);

  if (!application) {
    notFound();
  }

  return <ReceiptView application={application} />;
}

export function generateMetadata({ params }: ReceiptPageProps) {
    return {
        title: `Receipt for Application ${params.id}`
    }
}
