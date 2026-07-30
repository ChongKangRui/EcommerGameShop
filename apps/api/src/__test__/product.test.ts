 import request from "supertest";



 import app from "../app"; 

describe("product", ()=>{
    describe('get products route', ()=>{
        it("Should return 200", async()=>{
          const res =  await request(app).get('/products/');
            expect(res.status).toBe(200);
        })
    })
     describe('get invalid single product route', ()=>{
        it("Should return 500", async()=>{
          const res =  await request(app).get('/products/123123asd123123');
            expect(res.status).toBe(404);
        })
    })
})