"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";

import Cell from "../table/Cell";
import type { RefundRow } from "@ecom/shared/src/type/refund";

export const refundColumn: ColumnDef<RefundRow>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(checked) =>
          table.toggleAllPageRowsSelected(!!checked)
        }
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    meta: { className: "w-12" },
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => (
         <Cell
           title={row.getValue("reason")}
           link={`/admin/refund/${row.original.order_id}`}
         />
      
    ),
    meta: { className: "w-28 md:w-auto" },
  },
  {
    accessorKey: "total_amount",
    header: "Amount(RM)",
    cell: ({ row }) => {
      return (
        <span className="font-medium text-center">
          RM{row.original.amount}
        </span>
      );
    },
    meta: { className: "w-24" },
  },

  {
    accessorKey: "status",
    header: "Status",
    meta: { className: "w-20" },
  },

  {
    accessorKey: "requested_by",
    header: "Request by",
     cell: ({ row }) => (
         <div className=" truncate">{row.getValue("requested_by")}</div>
          
    ),
    meta: { className: "w-20 md:w-30" },
  },
  {
    accessorKey: "processed_by",
    header: "Process by",
    cell: ({ row }) => (
         <div className="truncate">{row.getValue("processed_by")}</div>
          
    ),
    meta: { className: "w-20 md:w-30" },
  },
];
