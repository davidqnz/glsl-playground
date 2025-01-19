import { expect, describe, it, beforeEach } from "bun:test";
import { testUserCredentials, setupDbForTest, testPrograms, setCookieRegex } from "./utils";
import { app } from "../app";
import environment from "../environment";

describe("API /programs routes", () => {
  beforeEach(async () => {
    await setupDbForTest();
  });

  function expectProgram(program: any) {
    expect(program).toMatchObject({
      id: expect.any(String),
      userId: expect.any(String),
      title: expect.any(String),
      vertexSource: expect.any(String),
      fragmentSource: expect.any(String),
      didCompile: expect.any(Boolean),
      createdAt: expect.any(String),
      modifiedAt: expect.any(String),
    });
  }

  it("GET /programs/:id should return a program", async () => {
    const response = await app.request(`/api/v1/programs/${testPrograms.existing.id}`);
    expect(response.status).toEqual(200);
    const body = await response.json();
    expectProgram(body);
  });

  it("GET /programs/:id should return 404 for invalid id", async () => {
    const response = await app.request("/api/v1/programs/64f05b2a-50f5-43fd-9331-50f0c03e4495");
    expect(response.status).toEqual(404);
  });

  it("GET /programs should return all the user's programs", async () => {
    // Log in
    let response = await app.request("/api/v1/users/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testUserCredentials.existing),
    });
    const token = response.headers.getSetCookie()[0].match(setCookieRegex)![1];

    // Get programs
    response = await app.request("/api/v1/programs", {
      headers: {
        Cookie: `${environment.SESSION_COOKIE}=${token}`,
      },
    });
    expect(response.status).toEqual(200);
    const body = await response.json();
    expect(body).toBeArray();
    expectProgram(body[0]);
  });

  it("POST /programs should create and return a new program", async () => {
    // Log in
    let response = await app.request("/api/v1/users/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testUserCredentials.existing),
    });
    const token = response.headers.getSetCookie()[0].match(setCookieRegex)![1];

    const newProgramData = {
      title: "a new program",
      vertexSource: "bahfjasdhlkjg",
      fragmentSource: "ajhsdfliuhefa",
      didCompile: false,
    };

    response = await app.request("/api/v1/programs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `${environment.SESSION_COOKIE}=${token}`,
      },
      body: JSON.stringify(newProgramData),
    });
    expect(response.status).toEqual(200);

    const body = await response.json();
    expectProgram(body);
    expect(body.title).toEqual(newProgramData.title);
    expect(body.vertexSource).toEqual(newProgramData.vertexSource);
    expect(body.fragmentSource).toEqual(newProgramData.fragmentSource);
    expect(body.didCompile).toEqual(newProgramData.didCompile);
  });

  it("POST /programs requires authentication", async () => {
    const newProgramData = {
      title: "a new program",
      vertexSource: "bahfjasdhlkjg",
      fragmentSource: "ajhsdfliuhefa",
      didCompile: false,
    };

    const response = await app.request("/api/v1/programs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newProgramData),
    });
    expect(response.status).toEqual(401);
  });

  it("PATCH /programs/:id should update a program", async () => {
    // Log in
    let response = await app.request("/api/v1/users/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testUserCredentials.existing),
    });
    const token = response.headers.getSetCookie()[0].match(setCookieRegex)![1];

    // Get some updated data
    const updateData = {
      vertexSource: "new vertex code",
      fragmentSource: "new fragment code",
    };

    // Do the update
    response = await app.request(`/api/v1/programs/${testPrograms.existing.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: `${environment.SESSION_COOKIE}=${token}`,
      },
      body: JSON.stringify(updateData),
    });
    expect(response.status).toEqual(200);

    const body = await response.json();
    expectProgram(body);
    expect(body.vertexSource).toEqual(updateData.vertexSource);
    expect(body.fragmentSource).toEqual(updateData.fragmentSource);
  });

  it("PATCH /programs/:id shouldn't allow updating programs not owned by the current user", async () => {
    // Log in
    let response = await app.request("/api/v1/users/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testUserCredentials.troublesome),
    });
    const token = response.headers.getSetCookie()[0].match(setCookieRegex)![1];

    // Try to modify another user's program
    response = await app.request(`/api/v1/programs/${testPrograms.existing.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: `${environment.SESSION_COOKIE}=${token}`,
      },
      body: JSON.stringify({ title: "user 1 smells" }),
    });
    expect(response.status).toEqual(403);
  });

  it("DELETE /programs/:id should delete a program", async () => {
    // Log in
    let response = await app.request("/api/v1/users/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testUserCredentials.existing),
    });
    const token = response.headers.getSetCookie()[0].match(setCookieRegex)![1];

    // Delete the program
    response = await app.request(`/api/v1/programs/${testPrograms.existing.id}`, {
      method: "DELETE",
      headers: {
        Cookie: `${environment.SESSION_COOKIE}=${token}`,
      },
    });
    expect(response.status).toEqual(200);

    response = await app.request(`/api/v1/programs/${testPrograms.existing.id}`);
    expect(response.status).toEqual(404);
  });

  it("DELETE /programs/:id shouldn't allow users to delete programs they don't own", async () => {
    // Log in
    let response = await app.request("/api/v1/users/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testUserCredentials.troublesome),
    });
    const token = response.headers.getSetCookie()[0].match(setCookieRegex)![1];

    // Try to delete the program
    response = await app.request(`/api/v1/programs/${testPrograms.existing.id}`, {
      method: "DELETE",
      headers: {
        Cookie: `${environment.SESSION_COOKIE}=${token}`,
      },
    });
    expect(response.status).toEqual(403);
  });
});
