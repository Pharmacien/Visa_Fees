import { z } from "zod";

export const ApplicationSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().min(3, { message: "Full name must be at least 3 characters." }),
  passportNumber: z.string().regex(/^[A-PR-WYa-pr-wy][1-9]\d\s?\d{4,5}$|[A-PR-WYa-pr-wy][1-9]\d{5,6}$/, { message: "Please enter a valid passport number." }),
  address: z.string().min(5, { message: "Address must be at least 5 characters." }),
  applicationDate: z.date({
    required_error: "An application date is required.",
  }),
  amountPaid: z.coerce.number().positive({ message: "Amount must be greater than 0." }),
});

export type Application = z.infer<typeof ApplicationSchema>;
