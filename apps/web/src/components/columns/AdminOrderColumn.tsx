"use client";

import { Checkbox } from "@/components/ui/checkbox";
import type { Order } from "@ecom/shared/src/type/order";
import { type ColumnDef } from "@tanstack/react-table";
import Cell from "../table/Cell";


export const adminOrderColumns: ColumnDef<Order>[] = [
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
    accessorKey: "order_id",
    header: "Id",
    cell: ({ row }) => (
       <Cell
              title={`#${row.original.order_id.slice(0,6)}`}
              link={`/admin/orders/${row.original.order_id}`}
              //name={row.getValue("name")}
            />
    ),
    meta: { className: "w-28 md:w-auto" },
  },
  {
    accessorKey: "name",
    header: "Customer",
    cell: ({ row }) => (
      <div
        className="truncate"
        //name={row.getValue("name")}
      >
        {row.original.name}
      </div>
    ),
    meta: { className: "w-20 lg:w-40 truncate" },
  },
  {
    accessorKey: "email",
    header: "Email",
    meta: { className: "w-35" },
  },
  {
    accessorKey: "total_amount",
    header: "Total(RM)",
    meta: { className: "w-24" },
  },
  {
    accessorKey: "status",
    header: "Status",
    meta: { className: "w-24" },
  },
];
