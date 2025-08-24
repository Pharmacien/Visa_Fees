import type { Application } from "./schema";

export const applications: Application[] = [
  {
    id: "1",
    fullName: "John Doe",
    passportNumber: "A12345678",
    applicationDate: new Date("2023-10-15"),
    amountPaid: 250.00,
  },
  {
    id: "2",
    fullName: "Jane Smith",
    passportNumber: "B87654321",
    applicationDate: new Date("2023-11-01"),
    amountPaid: 180.50,
  },
  {
    id: "3",
    fullName: "Peter Jones",
    passportNumber: "C24681357",
    applicationDate: new Date("2023-09-20"),
    amountPaid: 320.75,
  },
];
