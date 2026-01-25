import request from "supertest";
import app from "../src/server.js"; // Must include .js

describe("Health API Test", () => {
  it("should return 200 OK", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
  });
});
