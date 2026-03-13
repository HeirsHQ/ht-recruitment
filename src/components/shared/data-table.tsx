"use client";

import { useState } from "react";
import type {
  ColumnDef,
  ColumnFiltersState,
  ColumnOrderState,
  RowSelectionState,
  SortingState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "./pagination";

interface Props<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  pageSize?: number;
  rowSelection?: RowSelectionState;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowSelectionChange,
  pageSize = 10,
  rowSelection: externalRowSelection,
}: Props<TData, TValue>) {
  const [internalRowSelection, setInternalRowSelection] = useState<RowSelectionState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  const rowSelection = externalRowSelection ?? internalRowSelection;

  const handleRowSelectionChange = (
    updaterOrValue: RowSelectionState | ((old: RowSelectionState) => RowSelectionState),
  ) => {
    const newSelection = typeof updaterOrValue === "function" ? updaterOrValue(rowSelection) : updaterOrValue;
    if (onRowSelectionChange) {
      onRowSelectionChange(newSelection);
    } else {
      setInternalRowSelection(newSelection);
    }
  };

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: handleRowSelectionChange,
    onSortingChange: setSorting,
    onColumnOrderChange: setColumnOrder,
    state: {
      columnFilters,
      columnOrder,
      rowSelection,
      sorting,
    },
    initialState: {
      pagination: { pageSize },
    },
  });

  return (
    <div className="w-full">
      <div className="w-full rounded-lg border">
        <Table className="font-body">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                className="bg-neutral-100 text-black dark:bg-neutral-800 dark:text-white"
                key={headerGroup.id}
                style={{ borderRadius: "8px 8px 0 0" }}
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="font-medium first:rounded-tl-lg last:rounded-tr-lg">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
                  className="h-13 hover:bg-gray-50 data-selected:bg-gray-100 dark:hover:bg-neutral-700 dark:data-selected:bg-neutral-800"
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="whitespace-nowrap text-black dark:text-white">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-75 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {table.getPageCount() > 1 && (
        <Pagination
          onPageChange={(page) => table.setPageIndex(page)}
          onPageSizeChange={(size) => table.setPageSize(size)}
          page={table.getState().pagination.pageIndex}
          pageSize={table.getState().pagination.pageSize}
          total={table.getFilteredRowModel().rows.length}
        />
      )}
    </div>
  );
}
