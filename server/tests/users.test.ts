import { expect, describe, it, beforeEach } from "bun:test";
import { app } from "../app";
import environment from "../environment";
import { testUserCredentials, setupDbForTest, setCookieRegex, clearCookieRegex } from "./utils";

describe("API /users routes", () => {
  beforeEach(async () => {
    await setupDbForTest();
  });

  it("POST /users should create a new user and log them in", async () => {
    const newUser = testUserCredentials.new;

    // POST to route to create new user
    const response = await app.request("/api/v1/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newUser),
    });
    expect(response.status).toEqual(200);

    // Should return user
    const body = await response.json();
    expect(body).toMatchObject({
      id: expect.any(String),
      email: newUser.email,
    });

    // Should set a session cookie
    const setCookie = response.headers.getSetCookie()[0];
    expect(setCookie).toMatch(setCookieRegex);
  });

  it("POST /users should error if email already exists", async () => {
    // Some credentials with the same email as an existing user
    const userCredentials = { ...testUserCredentials.existing, password: "blahblahblah" };

    // Expect sign-up request to fail
    const response = await app.request("/api/v1/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userCredentials),
    });
    expect(response.status).toEqual(409);
  });

  it("GET /users/me should return the current user", async () => {
    const userCredentials = testUserCredentials.existing;

    // First Log in
    let response = await app.request("/api/v1/users/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userCredentials),
    });
    const token = response.headers.getSetCookie()[0].match(setCookieRegex)![1];

    // Now get the current user
    response = await app.request("/api/v1/users/me", {
      headers: {
        Cookie: `${environment.SESSION_COOKIE}=${token};`,
      },
    });
    expect(response.status).toEqual(200);

    const body = await response.json();
    expect(body).toMatchObject({
      id: expect.any(String),
      email: userCredentials.email,
    });
  });

  it("GET /users/me should return 401 status if not logged in", async () => {
    // Get the current user without logging in
    const response = await app.request("/api/v1/users/me");
    expect(response.status).toEqual(200);
    const body = await response.json();
    expect(body).toEqual(null);
  });

  it("POST /users/sessions should log a user in", async () => {
    const userCredentials = testUserCredentials.existing;

    // Request should be successful
    const response = await app.request("/api/v1/users/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userCredentials),
    });
    expect(response.status).toEqual(200);

    // Should set a session cookie
    const setCookie = response.headers.getSetCookie()[0];
    expect(setCookie).toMatch(new RegExp(setCookieRegex));
  });

  it("DELETE /users/sessions should log a user out", async () => {
    const userCredentials = testUserCredentials.existing;

    // First Log in
    let response = await app.request("/api/v1/users/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userCredentials),
    });
    let token = response.headers.getSetCookie()[0].match(setCookieRegex)![1];

    // Should set a session cookie
    const setCookie = response.headers.getSetCookie()[0];
    expect(setCookie).toMatch(new RegExp(setCookieRegex));

    // Now log out
    response = await app.request("/api/v1/users/sessions", {
      method: "DELETE",
    });
    expect(response.status).toEqual(200);

    // Session cookie should be cleared
    token = response.headers.getSetCookie()[0].match(clearCookieRegex)![1];
  });
});
