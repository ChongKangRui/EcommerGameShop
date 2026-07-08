"use client";

import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { useState } from "react";

import { DataTable } from "@/components/table/DataTable";
import { useMediaQuery } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function ProductTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState({});

  const isSmallScreen = useMediaQuery("(max-width: 768px)");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
      columnVisibility: {
        //price: !isSmallScreen,
        price: !isSmallScreen
      }
      
    },
  });

  const colWidths = ["w-12", "w-28 md:w-auto", "w-13 md:w-24", "w-13 md:w-24", "w-13 md:w-24"];

  //console.log("columns being passed to table:", columns.map(c => ({ id: c.id, accessorKey: (c as any).accessorKey })));
  return (
    <div>
      {table.getFilteredSelectedRowModel().rows.length > 0 && (
        <div className="text-sm text-muted-foreground px-5 py-2">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
      )}
      <DataTable table={table} columnsLength={columns.length} colWidths={colWidths}></DataTable>
    </div>
  );
}
