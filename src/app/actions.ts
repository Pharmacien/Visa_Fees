"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ApplicationSchema, type Application } from "@/lib/schema";
import { validateApplicationData } from "@/ai/flows/validate-application-data";
import { format } from "date-fns";

// In-memory store for demonstration purposes
let applications: Application[] = [
  { id: "app-01", fullName: "John Doe", passportNumber: "A12345678", applicationDate: new Date("2024-05-15"), amountPaid: 250 },
  { id: "app-02", fullName: "Jane Smith", passportNumber: "B87654321", applicationDate: new Date("2024-06-01"), amountPaid: 180.50 },
  { id: "app-03", fullName: "Peter Jones", passportNumber: "C54738291", applicationDate: new Date("2024-06-20"), amountPaid: 320.75 },
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getApplications() {
  return applications;
}

export async function getApplicationById(id: string) {
  return applications.find((app) => app.id === id) || null;
}

export async function createApplication(data: unknown) {
  const parsed = ApplicationSchema.safeParse(data);

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { fullName, passportNumber, applicationDate, amountPaid } = parsed.data;

  // AI Validation
  try {
    const validationResult = await validateApplicationData({
      full_name: fullName,
      passport_number: passportNumber,
      application_date: format(applicationDate, "yyyy-MM-dd"),
      amount_paid: amountPaid,
    });

    if (!validationResult.isValid && validationResult.errors) {
       // A simple mapping from AI error strings to form fields.
       const fieldErrors: Record<string, string[]> = {};
       validationResult.errors.forEach(error => {
         if (error.toLowerCase().includes('name')) {
           fieldErrors.fullName = [error];
         } else if (error.toLowerCase().includes('passport')) {
           fieldErrors.passportNumber = [error];
         } else if (error.toLowerCase().includes('date')) {
            fieldErrors.applicationDate = [error];
         } else if (error.toLowerCase().includes('amount')) {
            fieldErrors.amountPaid = [error];
         } else {
           fieldErrors.root = [...(fieldErrors.root || []), error];
         }
       });

      return { success: false, errors: fieldErrors };
    }
  } catch (e) {
    console.error("AI validation failed:", e);
    return { success: false, errors: { root: ["AI validation service is unavailable. Please try again later."] }};
  }
  
  const newApplication: Application = {
    id: `app-${Date.now()}`,
    ...parsed.data,
  };

  applications.unshift(newApplication);
  revalidatePath("/");
  return { success: true, application: newApplication };
}

export async function updateApplication(data: unknown) {
  const parsed = ApplicationSchema.extend({ id: z.string() }).safeParse(data);

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { id, ...updatedData } = parsed.data;
  const index = applications.findIndex((app) => app.id === id);

  if (index === -1) {
    return { success: false, errors: { root: ["Application not found."] } };
  }
  
  applications[index] = { ...applications[index], ...updatedData };
  revalidatePath("/");
  revalidatePath(`/receipt/${id}`);
  return { success: true, application: applications[index] };
}

export async function deleteApplication(id: string) {
  await sleep(500); // Simulate network latency
  const index = applications.findIndex((app) => app.id === id);

  if (index === -1) {
    return { success: false, message: "Application not found." };
  }
  
  applications.splice(index, 1);
  revalidatePath("/");
  return { success: true, message: "Application deleted." };
}
