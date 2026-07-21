"use client";

import { Checkbox } from "@/components/ui/checkbox";
import type { Order } from "@ecom/shared/src/type/order";
import { type ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
// export type Payment = {
//   id: string
//   amount: number
//   status: "pending" | "processing" | "success" | "failed"
//   email: string
// }

function OrderCell({ order_id }: { order_id: string }) {
  const navigate = useNavigate();

  return (
    <div
      className="truncate cursor-pointer hover:underline"
      title={order_id}
      onClick={() => {navigate(`/admin/orders/${order_id}`)}}
    >
      {order_id}
    </div>
  );
}

export const orderColumns: ColumnDef<Order>[] = [
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
      <OrderCell
        order_id={row.original.order_id}
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
