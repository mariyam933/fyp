import * as React from "react";
import {
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Spinner } from "@/components/ui/loader";
import { useRouter } from "next/router";
import CreateCustomerModal from "./CreateBillModal";
import { billsColumns } from "./bills-columns";
import CreateBillModal from "./CreateBillModal";
import CheckBillModal from "./CheckBillModal";

import { useAuth } from "@/context/auth";
import { Check } from "lucide-react";

interface DataTableDemoProps {
  tabledata: any[];
  loading?: boolean;
  setRefreshUI: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function BillsTable({
  tabledata,
  loading,
  setRefreshUI,
}: DataTableDemoProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const auth = useAuth();
  const userRole = Number(auth?.user?.role);

  const router = useRouter();
  const { meterNo } = router.query;

  const table = useReactTable({
    data: tabledata || [],
    columns: billsColumns({ setRefreshUI }),
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
    },
  });

  // Define max number of page buttons to show
  const maxPageButtons = 5;

  // Helper function to determine which page buttons to show
  const getPageButtons = () => {
    const pageIndex = table.getState().pagination.pageIndex;
    const pageCount = table.getPageCount();
    let startPage = Math.max(pageIndex - Math.floor(maxPageButtons / 2), 0);
    let endPage = startPage + maxPageButtons - 1;

    if (endPage >= pageCount) {
      endPage = pageCount - 1;
      startPage = Math.max(endPage - maxPageButtons + 1, 0);
    }

    const pages = [] as any[];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="w-full">
      <h1 className="text-xl text-gray-700 font-semibold">All Bills</h1>
      <div className="flex items-center py-4">
        <Input
          placeholder="Search bills by Sr No..."
          value={
            (table.getColumn("meterSrNo")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("meterSrNo")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        {userRole === 2 ? (
          <CheckBillModal setRefreshUI={setRefreshUI}></CheckBillModal>
        ) : (
          <CreateBillModal setRefreshUI={setRefreshUI} />
        )}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-gray-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <Spinner size="small" show={loading} />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
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
                <TableCell colSpan={6} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center">
        <div className="text-sm text-gray-600 ml-1">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center ml-auto justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            First
          </Button>
          {getPageButtons().map((page) => (
            <Button
              key={page}
              variant={
                table.getState().pagination.pageIndex === page
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={() => table.setPageIndex(page)}
            >
              {page + 1}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            Last
          </Button>
        </div>
      </div>
    </div>
  );
}
