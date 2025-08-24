import { ApplicationForm } from "@/components/application-form";
import { ApplicationsTable } from "@/components/applications-table";
import { getApplications } from "./actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function Home() {
  const applications = await getApplications();

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <h1 className="text-3xl font-bold font-headline mb-8">Dashboard</h1>
      <Tabs defaultValue="new-application" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="new-application">New Visa Application</TabsTrigger>
          <TabsTrigger value="report">Applications Report</TabsTrigger>
        </TabsList>
        <TabsContent value="new-application" className="pt-6">
            <ApplicationForm />
        </TabsContent>
        <TabsContent value="report" className="pt-6">
          <ApplicationsTable data={applications} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
