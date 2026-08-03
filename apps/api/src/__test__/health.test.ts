import request from "supertest";

import app from "../app"; // adjust path/name to match your actual entry file export


describe("test server boots and responds", () => {
  it("GET / returns 200 and the expected message", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Server is working!" });
  });

  it("confirms NODE_ENV is set to test", () => {
    expect(process.env.NODE_ENV).toBe("test");
  });
});