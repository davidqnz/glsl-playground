import { expect, describe, it, beforeEach } from "bun:test";
import { testUserCredentials, setupDbForTest, testPrograms, TestAgent } from "./utils";

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
    const agent = new TestAgent();

    const response = await agent.get(`/api/v1/programs/${testPrograms.existing.id}`);
    expect(response.status).toEqual(200);
    const body = await response.json();
    expectProgram(body);
  });

  it("GET /programs/:id should return 404 for invalid id", async () => {
    const agent = new TestAgent();

    const response = await agent.get("/api/v1/programs/64f05b2a-50f5-43fd-9331-50f0c03e4495");
    expect(response.status).toEqual(404);
  });

  it("GET /programs should return all the user's programs", async () => {
    const agent = new TestAgent();

    // Log in
    let response = await agent.post("/api/v1/users/sessions", testUserCredentials.existing);

    // Get programs
    response = await agent.get("/api/v1/programs");
    expect(response.status).toEqual(200);
    const body = await response.json();
    expect(body).toBeArray();
    expectProgram(body[0]);
  });

  it("POST /programs should create and return a new program", async () => {
    const agent = new TestAgent();

    // Log in
    let response = await agent.post("/api/v1/users/sessions", testUserCredentials.existing);

    const newProgramData = {
      title: "a new program",
      vertexSource: "bahfjasdhlkjg",
      fragmentSource: "ajhsdfliuhefa",
      didCompile: false,
    };

    response = await agent.post("/api/v1/programs", newProgramData);
    expect(response.status).toEqual(200);
    const body = await response.json();
    expectProgram(body);
    expect(body.title).toEqual(newProgramData.title);
    expect(body.vertexSource).toEqual(newProgramData.vertexSource);
    expect(body.fragmentSource).toEqual(newProgramData.fragmentSource);
    expect(body.didCompile).toEqual(newProgramData.didCompile);
  });

  it("POST /programs requires authentication", async () => {
    const agent = new TestAgent();

    const newProgramData = {
      title: "a new program",
      vertexSource: "bahfjasdhlkjg",
      fragmentSource: "ajhsdfliuhefa",
      didCompile: false,
    };

    const response = await agent.post("/api/v1/programs", newProgramData);
    expect(response.status).toEqual(401);
  });

  it("PATCH /programs/:id should update a program", async () => {
    const agent = new TestAgent();

    // Log in
    let response = await agent.post("/api/v1/users/sessions", testUserCredentials.existing);

    // Get some updated data
    const updateData = {
      vertexSource: "new vertex code",
      fragmentSource: "new fragment code",
    };

    // Do the update
    response = await agent.patch(`/api/v1/programs/${testPrograms.existing.id}`, updateData);
    expect(response.status).toEqual(200);
    const body = await response.json();
    expectProgram(body);
    expect(body.vertexSource).toEqual(updateData.vertexSource);
    expect(body.fragmentSource).toEqual(updateData.fragmentSource);
  });

  it("PATCH /programs/:id shouldn't allow updating programs not owned by the current user", async () => {
    const agent = new TestAgent();

    // Log in
    let response = await agent.post("/api/v1/users/sessions", testUserCredentials.troublesome);

    // Try to modify another user's program
    response = await agent.patch(`/api/v1/programs/${testPrograms.existing.id}`, { title: "user 1 smells" });
    expect(response.status).toEqual(403);
  });

  it("DELETE /programs/:id should delete a program", async () => {
    const agent = new TestAgent();

    // Log in
    let response = await agent.post("/api/v1/users/sessions", testUserCredentials.existing);

    // Delete the program
    response = await agent.delete(`/api/v1/programs/${testPrograms.existing.id}`);
    expect(response.status).toEqual(200);

    // Check that it's gone
    response = await agent.get(`/api/v1/programs/${testPrograms.existing.id}`);
    expect(response.status).toEqual(404);
  });

  it("DELETE /programs/:id shouldn't allow users to delete programs they don't own", async () => {
    const agent = new TestAgent();

    // Log in
    let response = await agent.post("/api/v1/users/sessions", testUserCredentials.troublesome);

    // Try to delete the program
    response = await agent.delete(`/api/v1/programs/${testPrograms.existing.id}`);
    expect(response.status).toEqual(403);
  });
});
