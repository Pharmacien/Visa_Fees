import { ApplicationForm } from "@/components/application-form";
import { ApplicationsTable } from "@/components/applications-table";
import { getApplications } from "./actions";

export default async function Home() {
  const applications = await getApplications();

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold font-headline mb-8">Dashboard</h1>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                <div className="lg:col-span-2">
                    <div className="sticky top-24">
                        <ApplicationForm />
                    </div>
                </div>
                <div className="lg:col-span-3">
                    <ApplicationsTable data={applications} />
                </div>
            </div>
        </div>
    </div>
  );
}
