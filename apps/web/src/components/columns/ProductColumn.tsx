"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";

import { type Product } from "@ecom/shared/src/type/product";
import Cell from "../table/Cell";



export const productColumn: ColumnDef<Product>[] = [
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
    accessorKey: "name",
    header: "Product Name",
    cell: ({ row }) => (
      <Cell
        title={row.getValue("name")}
        link={`/admin/products/${row.original.product_id})}`}
      />
    ),
    meta: { className: "w-28 md:w-auto" },
  },
  {
    accessorKey: "price",
    header: "Price(RM)",
    cell: ({ row }) => {
      const price = parseFloat(row.original.price);
      const discount = parseFloat(row.original.discount_percentage);
      const hasDiscount = discount > 0;
      const finalPrice = hasDiscount ? price * (1 - discount / 100) : price;

      return (
        <div className="flex flex-col">
          <span className="font-medium">RM{finalPrice.toFixed(2)}</span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground">
              <span className="line-through">RM{price.toFixed(2)}</span>{" "}
              <span className="text-green-600">-{discount}%</span>
            </span>
          )}
        </div>
      );
    },
    meta: { className: "w-24" },
  },

  {
    accessorKey: "is_active",
    header: "Active&Promote",
    cell: ({ row }) => {
      const isActive = row.original.is_active;
      const isPromoted = row.original.push_home_page;

      return (
        <div className="flex flex-col">
          <span className={isPromoted ? "text-green-400" : "text-red-500"}>
            {isPromoted ? "Promoted" : "Not Promoted"}
          </span>
          <span className={isActive ? "text-green-400" : "text-red-500"}>
            {isActive ? "Active" : "Not Active"}
          </span>
        </div>
      );
    },
    meta: { className: "w-30" },
  },

  {
    accessorKey: "total_stock",
    header: "Stock",
    meta: { className: "w-13 md:w-15" },
  },
  {
    accessorKey: "revenue",
    header: "Revenues",
    meta: { className: "w-13 md:w-15" },
  },
];
