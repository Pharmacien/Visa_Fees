'use server';

/**
 * @fileOverview AI-powered tool to validate visa application data.
 *
 * - validateApplicationData - A function that validates visa application data.
 * - ValidateApplicationDataInput - The input type for the validateApplicationData function.
 * - ValidateApplicationDataOutput - The return type for the validateApplicationData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateApplicationDataInputSchema = z.object({
  full_name: z.string().describe('The full name of the applicant.'),
  passport_number: z.string().describe('The passport number of the applicant.'),
  application_date: z.string().describe('The application date.'),
  amount_paid: z.number().describe('The amount paid for the application.'),
});
export type ValidateApplicationDataInput = z.infer<
  typeof ValidateApplicationDataInputSchema
>;

const ValidateApplicationDataOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the application data is valid.'),
  errors: z
    .array(z.string())
    .describe('A list of errors found in the application data.'),
});
export type ValidateApplicationDataOutput = z.infer<
  typeof ValidateApplicationDataOutputSchema
>;

export async function validateApplicationData(
  input: ValidateApplicationDataInput
): Promise<ValidateApplicationDataOutput> {
  return validateApplicationDataFlow(input);
}

const validateApplicationDataPrompt = ai.definePrompt({
  name: 'validateApplicationDataPrompt',
  input: {schema: ValidateApplicationDataInputSchema},
  output: {schema: ValidateApplicationDataOutputSchema},
  prompt: `You are an AI assistant that validates visa application data.

  Determine if the provided application data is valid based on the following criteria:
  - The full name should be a valid name.
  - The passport number should be a valid passport number.
  - The application date should be a valid date.
  - The amount paid should be a valid amount.

  Return a JSON object with the following format:
  {
    "isValid": true/false,
    "errors": ["list of errors"]
  }

  Application Data:
  Full Name: {{{full_name}}}
  Passport Number: {{{passport_number}}}
  Application Date: {{{application_date}}}
  Amount Paid: {{{amount_paid}}}
  `,
});

const validateApplicationDataFlow = ai.defineFlow(
  {
    name: 'validateApplicationDataFlow',
    inputSchema: ValidateApplicationDataInputSchema,
    outputSchema: ValidateApplicationDataOutputSchema,
  },
  async input => {
    const {output} = await validateApplicationDataPrompt(input);
    return output!;
  }
);
