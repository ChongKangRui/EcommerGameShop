import request from "supertest";

import app from "../app"; // adjust path/name to match your actual entry file export

describe("authentication test", () => {



  describe("put /user", () => {
     it("Unauthorized modify user infomation", async () => {
      const res = await request(app).put("/me");
      expect(res.status).toBe(401);
    });
   

  });



  describe("POST /register", () => {
     it("should return 400 for missing firstName", async () => {
      const res = await request(app).post("/register").send({
        firstName: "",
        lastName: "Doe",
        email: "john@example.com",
        password: "Password123",
        streetAddress: "123 Main St",
        city: "Kuala Lumpur",
        postalCode: "50000",
      });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });
    it("should return 201 for valid registration", async () => {
      const res = await request(app).post("/register").send({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "Password123",
        streetAddress: "123 Main St",
        city: "Kuala Lumpur",
        postalCode: "50000",
      });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("message");
    });

  });

   describe("POST /login", () => {

    //testuser@example.com
    //Test1234!
     it("should return 401 for incorrect password", async () => {
      const res = await request(app).post("/login").send({
        email: "testuser@example.com",
        password: "Test12",
        rememberMe: false
      });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error");
    });

     it("should return 200 for correct login", async () => {
      const res = await request(app).post("/login").send({
        email: "testuser@example.com",
        password: "Test1234!",
        rememberMe: false
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
    });


   
  });

});
