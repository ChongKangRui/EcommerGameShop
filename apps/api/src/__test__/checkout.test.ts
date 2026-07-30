// src/test/order.test.ts
import request from "supertest";

import app from "../app";
import { generateToken } from "src/utils/jwtHelper";

describe("post checkout init", () => {
  it("race condition testing time, both user trying to checkout last item at once", async () => {
    const customerToken = await generateToken(
      "00000000-0000-0000-0000-000000001001",
      "customer",
      false,
    );

    const adminToken = await generateToken(
      "00000000-0000-0000-0000-000000001002",
      "admin",
      false,
    );

    const [resCustomer, resAdmin] = await Promise.all([
      request(app)
        .post("/checkout/init")
        .set("Authorization", `Bearer ${customerToken}`),
      request(app)
        .post("/checkout/init")
        .set("Authorization", `Bearer ${adminToken}`),
    ]);

    const statuses = [resCustomer.status, resAdmin.status].sort();
    expect(statuses).toEqual([202, 409]);

    const stockCheck = await request(app).get("/products/99999");

    const variation = stockCheck.body.variations.find(
      (v: any) => v.variation_id === "00000000-0000-0000-0000-000000000001",
    );

    expect(variation).toBeDefined();
    expect(variation.stock).toBe(0);
  });
});
