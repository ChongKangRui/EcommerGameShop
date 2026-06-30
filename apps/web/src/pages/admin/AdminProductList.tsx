import { productColumn, type Product } from "../../components/admin/product/column/ProductColumn"
import { DataTable } from "../../components/table/DataTable"
import { ProductTable } from "@/components/admin/product/table/ProductTable"

function getData(): Product[] {
  // Fetch data from your API here.
  return [
    {
    id: "1",
    productName: "Zelda: Tears of the Kingdom",
    price: 59.99,
    stock: 25,
    sales: 120,
  },
  {
    id: "2",
    productName: "God of War Ragnarok lssssssssssssssssssssssssssssssssssssssssssssssdadadsadddddddddddddddddd",
    price: 49.99,
    stock: 15,
    sales: 89,
  },
  {
    id: "3",
    productName: "Super Mario Odyssey",
    price: 39.99,
    stock: 40,
    sales: 250,
  },
  {
    id: "4",
    productName: "Elden Ring",
    price: 59.99,
    stock: 10,
    sales: 300,
  },
  {
    id: "5",
    productName: "Spider-Man 2",
    price: 69.99,
    stock: 30,
    sales: 175,
  },
  ]
}

export default function AdminProductList() {
  const data = getData()
  
  return (
    <div className="container mx-auto py-10">
      
      <ProductTable columns={productColumn} data={data} />
    </div>
  )
}