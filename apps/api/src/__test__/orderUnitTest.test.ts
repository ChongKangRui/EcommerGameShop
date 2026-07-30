import { orderRepository } from "src/repositories/orderRepository";
import { orderService } from "src/services/orderService";
import { Logger } from "src/utils/loggerHelper";

jest.mock("src/repositories/orderRepository");
jest.mock("src/gateways/stripeGateway");

import { stripeGateway } from "src/gateways/stripeGateway";

const mockLog = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
} as unknown as Logger;

describe("order confirmation unit test", () => {
  it("stops polling on requires_payment_method", async () => {
    (
      orderRepository.getOrderStatusAndPaymentRef as jest.Mock
    ).mockResolvedValue({ status: "pending", payment_ref: "pi_123" });
    (stripeGateway.retrievePaymentIntent as jest.Mock).mockResolvedValue({
      status: "requires_payment_method",
    });

    const result = await orderService.confirmOrder(
      "order_1",
      "user_1",
      mockLog,
    );
    expect(result).toEqual({ status: "failed" });
  });

  it("invalid order, order doesn't exist", async () => {
    (
      orderRepository.getOrderStatusAndPaymentRef as jest.Mock
    ).mockResolvedValue(null);
    const result = await orderService.confirmOrder(
      "missing_order",
      "user_1",
      mockLog,
    );
    expect(result).toEqual({ status: "notFound" });
  });

  it("order already paid. return paid status", async () => {
    (
      orderRepository.getOrderStatusAndPaymentRef as jest.Mock
    ).mockResolvedValue({
      status: "paid",
      payment_ref: "pi_123",
    });
    const result = await orderService.confirmOrder(
      "order_1",
      "user_1",
      mockLog,
    );
    expect(result).toEqual({ status: "paid" });
    expect(stripeGateway.retrievePaymentIntent).not.toHaveBeenCalled();
  });

  it("return failed status as order canceled", async () => {
    (
      orderRepository.getOrderStatusAndPaymentRef as jest.Mock
    ).mockResolvedValue({
      status: "pending",
      payment_ref: "pi_123",
    });
    (stripeGateway.retrievePaymentIntent as jest.Mock).mockResolvedValue({
      status: "canceled",
    });
    const result = await orderService.confirmOrder(
      "order_1",
      "user_1",
      mockLog,
    );
    expect(result).toEqual({ status: "failed" });
  });
});
