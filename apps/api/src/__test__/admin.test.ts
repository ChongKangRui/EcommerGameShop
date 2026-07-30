// src/test/order.test.ts
import request from "supertest";

import app from "../app";
import { generateToken } from "src/utils/jwtHelper";

describe("GET Admin route test", () => {
  it("blocks non admin who try to get admin data", async () => {
    const customerToken = await generateToken(
      "00000000-0000-0000-0000-000000001001",
      "customer",
      false,
    );

    const res = await request(app)
      .get(`/admin/orders`)
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(401);
  });

  it("allows admin to get order", async () => {
    const adminToken = await generateToken(
      "00000000-0000-0000-0000-000000001002",
      "admin",
      false,
    );

  
    const res = await request(app)
      .get(`/admin/dashboard-report`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });
  
});


