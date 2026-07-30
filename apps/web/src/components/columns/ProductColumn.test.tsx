import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { productColumn } from "./ProductColumn";
import { flexRender, type Row } from "@tanstack/react-table";
import type { Product } from "@ecom/shared/type/product";

// grab the columns you actually want to test by their known position/id
const priceColumn = productColumn.find((c) => "accessorKey" in c && c.accessorKey === "price")!;

function makeFakeRow(product: Partial<Product>): Row<Product> {
  return {
    original: product as Product,
    getValue: (key: string) => (product as any)[key],
  } as Row<Product>;
}

describe("productColumn — price cell", () => {
  it("renders plain price with no discount styling when discount is 0", () => {
    const row = makeFakeRow({ price: "49.99", discount_percentage: "0" });
    render(<>{flexRender(priceColumn.cell, { row } as any)}</>);

    expect(screen.getByText("RM49.99")).toBeInTheDocument();
    expect(screen.queryByText(/line-through/)).not.toBeInTheDocument(); // no strikethrough rendered
    expect(screen.queryByText(/-0%/)).not.toBeInTheDocument();
  });

  it("computes and displays the discounted price alongside the original", () => {
    const row = makeFakeRow({ price: "100.00", discount_percentage: "20" });
    render(<>{flexRender(priceColumn.cell, { row } as any)}</>);

    expect(screen.getByText("RM80.00")).toBeInTheDocument();  // final price
    expect(screen.getByText("RM100.00")).toBeInTheDocument(); // original, struck through
    expect(screen.getByText("-20%")).toBeInTheDocument();
  });

  it("100% discount without showing a negative or NaN price", () => {

    const row = makeFakeRow({ price: "50.00", discount_percentage: "100" });
    render(<>{flexRender(priceColumn.cell, { row } as any)}</>);
    
    expect(screen.getByText("RM0.00")).toBeInTheDocument();
  });
});

