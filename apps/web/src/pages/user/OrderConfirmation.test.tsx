import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import OrderConfirmation from "./OrderConfirmation";

import { useOrderConfirm } from "@/hooks/useOrder";

vi.mock("@/hooks/useOrder", () => ({
  useOrderConfirm: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
  })),
  
}));

// helper — Register uses <Link> and useNavigate, both need Router context
function renderComponent(status?: string, orderId = "order_123") {
  return render(
    <MemoryRouter
      initialEntries={[
        {
          pathname: `/order/confirmation/${orderId}`,
          state: status ? { status } : undefined,
        },
      ]}
    >
      <Routes>
        <Route
          path="/order/confirmation/:orderId"
          element={<OrderConfirmation />}
        />
        <Route path="/" element={<div>Home Page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}
describe("Order confirmation", async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("On payment failed", async () => {
    const mockMutate = vi.fn((_data, { onSuccess }) => {
      onSuccess({ status: "failed" });
    });

    (useOrderConfirm as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    //const user = userEvent.setup();
    renderComponent();

    const linkElement = screen.getByText(/Payment Failed/i);
    expect(linkElement).toBeInTheDocument();
  });

  it("Order expired", () => {
    (useOrderConfirm as ReturnType<typeof vi.fn>).mockReturnValue({
      isPending: false,
    });
    //const user = userEvent.setup();
    renderComponent('invalid_order');

    const linkElement = screen.getByText(/Order expired/i);
    expect(linkElement).toBeInTheDocument();
  });

   it("Payment success",  () => {
    const mockMutate = vi.fn((_data, { onSuccess }) => {
      onSuccess({ status: "paid" });
    });

    (useOrderConfirm as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    //const user = userEvent.setup();
    renderComponent();

    const linkElement = screen.getByText(/Thank you for your purchase/i);
    expect(linkElement).toBeInTheDocument();
  });
});
