import { beforeEach, describe, expect, it } from "bun:test";

import environment from "../environment.js";
import { TestAgent, setupDbForTest, testUserCredentials } from "./utils.js";

describe("API /users routes", () => {
  beforeEach(async () => {
    await setupDbForTest();
  });

  it("POST /users should create a new user and log them in", async () => {
    const agent = new TestAgent();

    const newUser = testUserCredentials.new;

    // POST to route to create new user
    const response = await agent.post("/api/v1/users", newUser);
    expect(response.status).toEqual(200);

    // Should return new user
    const body = await response.json();
    expect(body).toMatchObject({
      id: expect.any(String),
      email: newUser.email,
    });

    // Should set a session cookie
    const cookie = agent.getCookie(environment.SESSION_COOKIE);
    expect(cookie).toBeTruthy();
  });

  it("POST /users should error if email already exists", async () => {
    const agent = new TestAgent();

    // Some credentials with the same email as an existing user
    const userCredentials = { ...testUserCredentials.existing, password: "blahblahblah" };

    // Expect sign-up request to fail
    const response = await agent.post("/api/v1/users", userCredentials);
    expect(response.status).toEqual(409);
  });

  it("GET /users/me should return the current user", async () => {
    const agent = new TestAgent();

    const userCredentials = testUserCredentials.existing;

    // First Log in
    let response = await agent.post("/api/v1/users/sessions", userCredentials);

    // Now get the current user
    response = await agent.get("/api/v1/users/me");
    expect(response.status).toEqual(200);
    const body = await response.json();
    expect(body).toMatchObject({
      id: expect.any(String),
      email: userCredentials.email,
    });
  });

  it("GET /users/me should return 401 status if not logged in", async () => {
    const agent = new TestAgent();

    // Get the current user without logging in
    const response = await agent.get("/api/v1/users/me");
    expect(response.status).toEqual(200);
    const body = await response.json();
    expect(body).toEqual(null);
  });

  it("POST /users/sessions should log a user in", async () => {
    const agent = new TestAgent();

    const userCredentials = testUserCredentials.existing;

    // Request should be successful
    const response = await agent.post("/api/v1/users/sessions", userCredentials);
    expect(response.status).toEqual(200);

    // Should set a session cookie
    const cookie = agent.getCookie(environment.SESSION_COOKIE);
    expect(cookie).toBeTruthy();
  });

  it("DELETE /users/sessions should log a user out", async () => {
    const agent = new TestAgent();

    const userCredentials = testUserCredentials.existing;

    // First Log in
    await agent.post("/api/v1/users/sessions", userCredentials);

    // Should set a session cookie
    let cookie = agent.getCookie(environment.SESSION_COOKIE);
    expect(cookie).toBeTruthy();

    // Now log out
    const response = await agent.delete("/api/v1/users/sessions");
    expect(response.status).toEqual(200);

    // Session cookie should be cleared
    cookie = agent.getCookie(environment.SESSION_COOKIE);
    expect(cookie).toBeUndefined();
  });
});
