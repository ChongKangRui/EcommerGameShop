"use client";

import { parseDateToLocal } from "@/lib/utils";
import type { Order } from "@ecom/shared/src/type/order";
import { type ColumnDef } from "@tanstack/react-table";

import Cell from "../table/Cell";


export const customerOrderColumns: ColumnDef<Order>[] = [

  {
    accessorKey: "order_id",
    header: "Id",
    cell: ({ row }) => (
      <Cell
        title={`#${row.original.order_id.slice(0,6)}`}
        link={`/order/${row.original.order_id}`}
        //name={row.getValue("name")}
      />
    ),
    meta: { className: "w-auto" },
  },

{
    accessorKey: "created_at",
    header: "Created Date",
     cell: ({ row }) => {
      const [date, time] = parseDateToLocal(row.original.created_at).split(", ");
      
      return(
     <div className="flex  flex-col justify-center items-center text-xs">
      <p>{date}</p>
      <p>{time}</p>
     </div>
      )
     },
    meta: { className: "w-24" },
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
