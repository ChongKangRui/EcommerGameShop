import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import QuantitySelector from "./QuantitySelector";

function renderSelector(overrides: Partial<React.ComponentProps<typeof QuantitySelector>> = {}) {
  const setQuantity = vi.fn();
  const props = {
    initialQuantity: 1,
    displayItemInCart: true,
    cartCount: 1,
    max: 10,
    currentQuantity: 5,
    disabled: false,
    setQuantity,
    showOutOfStock: true,
    ...overrides,
  };
  const utils = render(<QuantitySelector {...props} />);
  return { ...utils, setQuantity };
}

describe("QuantitySelector rendering", () => {
  it("shows the current quantity and cart count", () => {
    renderSelector({ currentQuantity: 7, cartCount: 3 });
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText(/Quantity \(3 in cart\)/i)).toBeInTheDocument();
  });

  it("hides the cart-count line when displayItemInCart is false", () => {
    renderSelector({ displayItemInCart: false });
    expect(screen.queryByText(/in cart/i)).not.toBeInTheDocument();
  });
});

describe("QuantitySelector out of stock", () => {
  it("shows 'Out of stock' and hides the +/- controls when max is 0 and showOutOfStock is true", () => {
    renderSelector({ max: 0, showOutOfStock: true });
    expect(screen.getByText(/out of stock/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /increase quantity/i })).not.toBeInTheDocument();
  });

  it(" disables the increase button when showOutOfStock is false", () => {
    renderSelector({ max: 0, showOutOfStock: false, currentQuantity: 5 });
    expect(screen.getByRole("button", { name: /increase quantity/i })).toBeDisabled();
  });

  it("does not enter edit mode when out of stock, even if the quantity button is clicked", async () => {
    const user = userEvent.setup();
    renderSelector({ max: 0, showOutOfStock: false, currentQuantity: 5 });

    await user.click(screen.getByRole("button", { name: /edit quantity/i }));
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});

describe("QuantitySelector increment / decrement", () => {
  it("calls setQuantity with quantity + 1 when increment is clicked", async () => {
    const user = userEvent.setup();
    const { setQuantity } = renderSelector({ currentQuantity: 5, max: 10 });

    await user.click(screen.getByRole("button", { name: /increase quantity/i }));
    expect(setQuantity).toHaveBeenCalledWith(6);
  });

  it("calls setQuantity with quantity - 1 when decrement is clicked", async () => {
    const user = userEvent.setup();
    const { setQuantity } = renderSelector({ currentQuantity: 5, max: 10 });

    await user.click(screen.getByRole("button", { name: /decrease quantity/i }));
    expect(setQuantity).toHaveBeenCalledWith(4);
  });

  it("disables decrement at quantity 1 and increment at max", () => {
    renderSelector({ currentQuantity: 1, max: 10 });
    expect(screen.getByRole("button", { name: /decrease quantity/i })).toBeDisabled();

    renderSelector({ currentQuantity: 10, max: 10 });
    expect(screen.getAllByRole("button", { name: /increase quantity/i }).at(-1)).toBeDisabled();
  });

  it("disables both buttons when disabled is true, regardless of quantity", () => {
    renderSelector({ currentQuantity: 5, max: 10, disabled: true });
    expect(screen.getByRole("button", { name: /increase quantity/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /decrease quantity/i })).toBeDisabled();
  });

  it("never calls setQuantity when clicking a disabled button", async () => {
    const user = userEvent.setup();
    const { setQuantity } = renderSelector({ currentQuantity: 10, max: 10 });

    await user.click(screen.getByRole("button", { name: /increase quantity/i }));
    expect(setQuantity).not.toHaveBeenCalled();
  });
});

describe("QuantitySelector — editing mode", () => {
  it("switches to an input showing the current quantity when clicked", async () => {
    const user = userEvent.setup();
    renderSelector({ currentQuantity: 5 });

    await user.click(screen.getByRole("button", { name: /edit quantity/i }));
    expect(screen.getByRole("textbox")).toHaveValue("5");
  });

  it("rejects a 3rd digit, keeping only the first 2", async () => {
    const user = userEvent.setup();
    renderSelector({ currentQuantity: 5, max: 99 });

    await user.click(screen.getByRole("button", { name: /edit quantity/i }));
    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "123");

    expect(input).toHaveValue("12");
  });

  it("commits and clamps to max on Enter", async () => {
    const user = userEvent.setup();
    const { setQuantity } = renderSelector({ currentQuantity: 5, max: 10 });

    await user.click(screen.getByRole("button", { name: /edit quantity/i }));
    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "99{Enter}");

    expect(setQuantity).toHaveBeenCalledWith(10);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("clamps a typed 0 up to 1, not down to 0", async () => {
    const user = userEvent.setup();
    const { setQuantity } = renderSelector({ currentQuantity: 5, max: 10 });

    await user.click(screen.getByRole("button", { name: /edit quantity/i }));
    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "0{Enter}");

    expect(setQuantity).toHaveBeenCalledWith(1);
  });

  it("falls back to the current quantity when committed empty", async () => {
    const user = userEvent.setup();
    const { setQuantity } = renderSelector({ currentQuantity: 5, max: 10 });

    await user.click(screen.getByRole("button", { name: /edit quantity/i }));
    await user.clear(screen.getByRole("textbox"));
    await user.keyboard("{Enter}");

    expect(setQuantity).toHaveBeenCalledWith(5);
  });

  it("discards the draft and calls nothing on Escape", async () => {
    const user = userEvent.setup();
    const { setQuantity } = renderSelector({ currentQuantity: 5, max: 10 });

    await user.click(screen.getByRole("button", { name: /edit quantity/i }));
    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "9{Escape}");

    expect(setQuantity).not.toHaveBeenCalled();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("commits on blur, same as Enter", async () => {
    const user = userEvent.setup();
    const { setQuantity } = renderSelector({ currentQuantity: 5, max: 10 });

    await user.click(screen.getByRole("button", { name: /edit quantity/i }));
    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "8");
    await user.tab();

    expect(setQuantity).toHaveBeenCalledWith(8);
  });
});