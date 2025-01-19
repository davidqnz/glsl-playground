import { expect, describe, it } from "bun:test";
import { app } from "../app";

describe("API /programs routes", () => {
  it("GET /health-check should return a healthy message", async () => {
    const response = await app.request("/api/v1/health-check");
    expect(response.status).toEqual(200);

    const body = await response.json();
    expect(body).toEqual({
      message: "healthy",
    });
  });
});
