"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { type Product } from "@ecom/shared/src/type/product";

// export type Product = {
//   product_id: string;
//   name: string;
//   price: number;
//   is_sold_out: string;
//   sales: number;
// };


function ProductNameCell({ product_id, name }: { product_id: number; name: string }) {
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
     meta: { className: "w-12" },
   
  },
  {
    accessorKey: "name",
    header: "Product Name",
    cell: ({ row }) => (
      <ProductNameCell product_id={row.original.product_id} name={row.getValue("name")} />
    ),
    meta: { className: "w-28 md:w-auto" },
    
  },
  {
    accessorKey: "price",
    header: "Price(RM)",
    meta: { className: "w-24" },
  },
  {
    accessorKey: "discount_percentage",
    header: "Discount%",

 meta: { className: "w-24" },
    
  },
  {
    accessorKey: "total_stock",
    header: "Stock",
     meta: { className: "w-13 md:w-24" },
  },
  {
    accessorKey: "sales",
    header: "Sales",
    meta: { className: "w-13 md:w-24" },
  },
];