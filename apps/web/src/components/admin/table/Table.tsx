"use client";

import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { useState } from "react";

import { DataTable } from "@/components/table/DataTable";


interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  columnVisibility?: {};
  rowSelection: {};
  setRowSelection: (rowSelection: {}) => void;
  bulkAction: React.ReactNode;
}

export function Table<TData, TValue>({
  columns,
  data,
  columnVisibility,
  rowSelection,
  setRowSelection,
  bulkAction
}: DataTableProps<TData, TValue>) {
  
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
      columnVisibility:columnVisibility
    },
  });



  return (


    <div className="">
      {table.getFilteredSelectedRowModel().rows.length > 0 && (
        <div className="flex flex-row justify-between">
          <div className="text-sm text-muted-foreground px-5 py-2">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          
            {bulkAction}
            
          
        </div>
      )}
      <DataTable table={table} columnsLength={columns.length}></DataTable>
    </div>
  );
}
