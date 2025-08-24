"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Application } from "@/lib/schema";
import { deleteApplication } from "@/app/actions";
import { ApplicationForm } from "./application-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { ChevronsUpDown, MoreHorizontal, FileText, Pencil, Trash2, Copy } from "lucide-react";
import { toZonedTime } from "date-fns-tz";


export function ApplicationsTable({ data }: { data: Application[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const [itemToDelete, setItemToDelete] = React.useState<Application | null>(null);
  const [itemToEdit, setItemToEdit] = React.useState<Application | null>(null);
  const [isDeleteLoading, setDeleteLoading] = React.useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setDeleteLoading(true);
    const result = await deleteApplication(itemToDelete.id!);
    setDeleteLoading(false);
    if (result.success) {
      toast({
        title: "Application Deleted",
        description: `The application for ${itemToDelete.fullName} has been deleted.`,
      });
      setItemToDelete(null);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.message,
      });
    }
  };
  
  const downloadAsCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Full Name", "Passport Number", "Application Date", "Amount Paid"].join(",") + "\n"
      + data.map(e => [e.fullName, e.passportNumber, format(new Date(e.applicationDate), "yyyy-MM-dd"), e.amountPaid].join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "visa_applications.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const columns: ColumnDef<Application>[] = [
    {
      accessorKey: "fullName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Full Name
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("fullName")}</div>,
    },
    {
      accessorKey: "passportNumber",
      header: "Passport Number",
      cell: ({ row }) => <div>{row.getValue("passportNumber")}</div>,
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => <div className="truncate max-w-xs">{row.getValue("address")}</div>,
    },
    {
      accessorKey: "applicationDate",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Application Date
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const dateValue = row.getValue("applicationDate");
        const utcDate = new Date(dateValue as string);
        const zonedDate = toZonedTime(utcDate, 'UTC');
        return (
          <div>
            {format(zonedDate, "PPP")}
          </div>
        );
      }
    },
    {
      accessorKey: "amountPaid",
      header: ({ column }) => (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Amount Paid
            <ChevronsUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("amountPaid"));
        const formatted = new Intl.NumberFormat("de-DE", {
          style: "currency",
          currency: "EUR",
        }).format(amount);
        return <div className="text-right font-medium">{formatted}</div>;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const application = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(application.id!)}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy application ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <Link href={`/receipt/${application.id}`}>
                 <DropdownMenuItem>
                    <FileText className="mr-2 h-4 w-4" />
                    View Receipt
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem onClick={() => setItemToEdit(application)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                onClick={() => setItemToDelete(application)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <Card className="h-fit">
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="font-headline text-2xl">Applications Report</CardTitle>
                    <CardDescription>
                        View, manage, and export all visa applications.
                    </CardDescription>
                </div>
                 <Button onClick={downloadAsCSV}>Download CSV</Button>
            </div>
        </CardHeader>
        <CardContent>
            <div className="w-full">
                <div className="flex items-center py-4">
                    <Input
                    placeholder="Filter by name..."
                    value={(table.getColumn("fullName")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("fullName")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                    />
                </div>
                <div className="rounded-md border">
                    <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                            return (
                                <TableHead key={header.id}>
                                {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                    )}
                                </TableHead>
                            );
                            })}
                        </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && "selected"}
                            >
                            {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id}>
                                {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                )}
                                </TableCell>
                            ))}
                            </TableRow>
                        ))
                        ) : (
                        <TableRow>
                            <TableCell
                            colSpan={columns.length}
                            className="h-24 text-center"
                            >
                            No results.
                            </TableCell>
                        </TableRow>
                        )}
                    </TableBody>
                    </Table>
                </div>
                <div className="flex items-center justify-end space-x-2 py-4">
                    <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    >
                    Previous
                    </Button>
                    <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    >
                    Next
                    </Button>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={!!itemToDelete}
                onOpenChange={(open) => !open && setItemToDelete(null)}
            >
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the
                    application for{" "}
                    <span className="font-semibold">{itemToDelete?.fullName}</span>.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isDeleteLoading}>
                    {isDeleteLoading ? "Deleting..." : "Continue"}
                    </AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Edit Dialog */}
            <Dialog open={!!itemToEdit} onOpenChange={(open) => !open && setItemToEdit(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <ApplicationForm 
                        application={itemToEdit!}
                        onSuccess={() => setItemToEdit(null)}
                    />
                </DialogContent>
            </Dialog>
        </CardContent>
    </Card>
  );
}
