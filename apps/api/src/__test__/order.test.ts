// src/test/order.test.ts
import request from "supertest";

import app from "../app";
import { generateToken } from "src/utils/jwtHelper";

describe("GET /order/me/:orderId - cross-user authorization", () => {
  it("blocks a customer from viewing another user's order", async () => {
    const customerToken = await generateToken(
      "00000000-0000-0000-0000-000000001001",
      "customer",
      false,
    );

    // Admin's order, fixed ID from 03_orders.sql
    const adminOrderId = "00000000-0000-0000-0000-000000002002";

    const res = await request(app)
      .get(`/order/me/${adminOrderId}`)
      .set("Authorization", `Bearer ${customerToken}`);

    expect([403, 404]).toContain(res.status);
  });

  it("allows a user to view their own order", async () => {
    const customerToken = await generateToken(
      "00000000-0000-0000-0000-000000001001",
      "customer",
      false,
    );

    const ownOrderId = "00000000-0000-0000-0000-000000002001";

    const res = await request(app)
      .get(`/order/me/${ownOrderId}`)
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
  });
  
});

describe("POST /order/refund/orderId - refund testing", () => {
 
  it("trying to refund an order that is not belong to customer", async () => {
    const customerToken = await generateToken(
      "00000000-0000-0000-0000-000000001001",
      "customer",
      false,
    );

    const adminOrderId = "00000000-0000-0000-0000-000000002002";

    const res = await request(app)
      .post(`/order/refund/${adminOrderId}`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ reason: "I just try to refund someone else order haha" });

    expect(res.status).toBe(403);
  });

  it("trying to refund an order that belong to correct user", async () => {
    const customerToken = await generateToken(
      "00000000-0000-0000-0000-000000001001",
      "customer",
      false,
    );

    const ownOrderId = "00000000-0000-0000-0000-000000002001";


    const res = await request(app)
      .post(`/order/refund/${ownOrderId}`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ reason: "I am having a defected item" });

    expect(res.status).toBe(200);
  });
});

