"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { toZonedTime } from "date-fns-tz";

import { cn } from "@/lib/utils";
import { ApplicationSchema, type Application } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { createApplication, updateApplication } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "./ui/textarea";

type ApplicationFormProps = {
  application?: Application;
  onSuccess?: () => void;
};

export function ApplicationForm({ application, onSuccess }: ApplicationFormProps) {
  const { toast } = useToast();
  const isEditMode = !!application;

  const form = useForm<Application>({
    resolver: zodResolver(ApplicationSchema),
    defaultValues: isEditMode
      ? { 
          ...application, 
          applicationDate: toZonedTime(new Date(application.applicationDate), 'UTC') 
        }
      : {
          fullName: "",
          passportNumber: "",
          address: "",
          applicationDate: undefined,
          amountPaid: 0,
        },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(data: Application) {
    const action = isEditMode ? updateApplication : createApplication;
    const result = await action(isEditMode ? { ...data, id: application.id } : data);

    if (result.success) {
      toast({
        title: isEditMode ? "Application Updated" : "Application Created",
        description: `The application for ${result.application?.fullName} has been successfully ${isEditMode ? 'updated' : 'processed'}.`,
      });
      if (!isEditMode) {
        form.reset();
      }
      onSuccess?.();
    } else {
      if (result.errors) {
        Object.entries(result.errors).forEach(([key, messages]) => {
          if(messages) {
             form.setError(key as keyof Application, {
                type: "manual",
                message: messages.join(", "),
              });
          }
        });
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please correct the errors and try again.",
        });
      } else {
         toast({
          variant: "destructive",
          title: "An error occurred",
          description: "Something went wrong. Please try again.",
        });
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">{isEditMode ? 'Edit Application' : 'New Visa Application'}</CardTitle>
        <CardDescription>
          {isEditMode ? 'Update the details for this application.' : 'Fill in the form to submit a new application.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="passportNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Passport Number</FormLabel>
                  <FormControl>
                    <Input placeholder="A12345678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="123 Main St, Anytown, USA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amountPaid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fees Paid (€)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="250.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="applicationDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Application Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="root.serverError"
              render={({ field }) => (
                <FormItem>
                  <FormMessage>{field.message}</FormMessage>
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? 'Saving...' : 'Validating & Submitting...'}
                </>
              ) : (
                isEditMode ? 'Save Changes' : 'Submit Application'
              )}
            </Button>
            {isSubmitting && !isEditMode && <FormDescription className="text-center">Our AI is validating your data. This may take a moment.</FormDescription>}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
