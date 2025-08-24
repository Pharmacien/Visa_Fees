import { Header } from "@/components/header";
import { ApplicationForm } from "@/components/application-form";
import { ApplicationsTable } from "@/components/applications-table";
import { getApplications } from "./actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";


export default async function Home() {
  const applications = await getApplications();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            <div className="lg:col-span-2 sticky top-24">
              <ApplicationForm />
            </div>
            <div className="lg:col-span-3">
              <ApplicationsTable data={applications} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
