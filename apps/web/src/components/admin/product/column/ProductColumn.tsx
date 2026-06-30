"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Product = {
  id: string;
  productName: string;
  price: number;
  stock: number;
  sales: number;
};


function ProductNameCell({ id, name }: { id: string; name: string }) {
  const navigate = useNavigate();

  return (
    <div
      className="truncate cursor-pointer hover:underline"
      title={name}
      onClick={() => navigate(`/admin/products/${id}`)}
    >
      {name}
    </div>
  );
}

export const productColumn: ColumnDef<Product>[] = [
  {
    id: "select",
    header: ({ table }) => {
      
      return (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={
            table.getIsSomePageRowsSelected() &&
            !table.getIsAllPageRowsSelected()
          }
          onCheckedChange={(checked) =>{
            table.toggleAllPageRowsSelected(checked)
            
          }}
          aria-label="Select all"
        />
      );
    },
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
    accessorKey: "productName",
    header: "Product Name",
    cell: ({ row }) => (
      <ProductNameCell id={row.original.id} name={row.getValue("productName")}></ProductNameCell>
    // <div className="truncate" title={row.getValue("productName")} onClick={}>
    //   {row.getValue("productName")}
    // </div>
  )
  },
  {
    accessorKey: "price",
    header: "Price",
  },
  {
    accessorKey: "stock",
    header: "Stock",
  },
  {
    accessorKey: "sales",
    header: "Sales",
  },
];
