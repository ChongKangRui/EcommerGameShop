"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Product = {
  product_id: string;
  name: string;
  price: number;
  is_sold_out: string;
  sales: number;
};


function ProductNameCell({ product_id, name }: { product_id: string; name: string }) {
  const navigate = useNavigate();

  return (
    <div
      className="truncate cursor-pointer hover:underline"
      title={name}
      onClick={() => navigate(`/admin/products/${product_id}`)}
    >
      {name}
    </div>
  );
}

export const productColumn: ColumnDef<Product>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(checked) => table.toggleAllPageRowsSelected(!!checked)}
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
  },
  {
    accessorKey: "name",
    header: "Product Name",
    cell: ({ row }) => (
      <ProductNameCell product_id={row.original.product_id} name={row.getValue("name")} />
    ),
  },
  {
    accessorKey: "price",
    header: "Price",
  },
  {
    accessorKey: "is_sold_out",
    header: "Sold Out",
  },
  {
    accessorKey: "sales",
    header: "Sales",
  },
];