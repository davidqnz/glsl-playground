import { beforeAll } from "bun:test";
import bcrypt from "bcrypt";
import { app } from "../app.js";
import { db, migrate, s } from "../database/db.js";

export const testUsers = {
  existing: {
    id: "cf374dce-85b2-4fbc-a27a-abcfe5431381",
    email: "existing.user@test.com",
    passwordHash: bcrypt.hashSync("123456", 1),
  },
  new: {
    id: "2a54b060-dfcd-49b7-b06a-f7ef38601243",
    email: "new.user@test.com",
    passwordHash: bcrypt.hashSync("qwerty", 1),
  },
  troublesome: {
    id: "67ee1b60-30bb-462c-93e9-a422613b5db4",
    email: "troublesome.user@test.com",
    passwordHash: bcrypt.hashSync("abcdef", 1),
  },
};

export const testUserCredentials = {
  existing: {
    email: "existing.user@test.com",
    password: "123456",
  },
  new: {
    email: "new.user@test.com",
    password: "qwerty",
  },
  troublesome: {
    email: "troublesome.user@test.com",
    password: "abcdef",
  },
};

export const testPrograms = {
  existing: {
    id: "c1676b35-42c7-465e-bd7d-a6ae2caa4015",
    userId: testUsers.existing.id,
    title: "a cool program",
    vertexSource: "vertex code",
    fragmentSource: "fragment code",
    didCompile: false,
  },
};

export class TestAgent {
  cookies: Map<string, string>;

  constructor() {
    this.cookies = new Map();
  }

  private serializeCookies(): string {
    return [...this.cookies.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
  }

  private processSetCookies(setCookies: string[]) {
    for (const h of setCookies) {
      const match = h.trim().match(/^([^\s=]+)=([^\s]*);/);
      if (!match) {
        throw new Error(`Set-Cookie header appears to malformed: ${h}`);
      }
      const [_, k, v] = match;
      if (v) {
        this.cookies.set(k, v);
      } else {
        this.cookies.delete(k);
      }
    }
  }

  getCookie(key: string): string | undefined {
    return this.cookies.get(key);
  }

  async get(path: string): Promise<Response> {
    const response = await app.request(path, {
      method: "GET",
      headers: {
        Cookie: this.serializeCookies(),
      },
    });
    const setCookies = response.headers.getSetCookie();
    this.processSetCookies(setCookies);
    return response;
  }

  async post(path: string, body: any): Promise<Response> {
    const response = await app.request(path, {
      method: "POST",
      headers: {
        Cookie: this.serializeCookies(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const setCookies = response.headers.getSetCookie();
    this.processSetCookies(setCookies);
    return response;
  }

  async put(path: string, body: any): Promise<Response> {
    const response = await app.request(path, {
      method: "PUT",
      headers: {
        Cookie: this.serializeCookies(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const setCookies = response.headers.getSetCookie();
    this.processSetCookies(setCookies);
    return response;
  }

  async patch(path: string, body: any): Promise<Response> {
    const response = await app.request(path, {
      method: "PATCH",
      headers: {
        Cookie: this.serializeCookies(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const setCookies = response.headers.getSetCookie();
    this.processSetCookies(setCookies);
    return response;
  }

  async delete(path: string): Promise<Response> {
    const response = await app.request(path, {
      method: "DELETE",
      headers: {
        Cookie: this.serializeCookies(),
        "Content-Type": "application/json",
      },
    });
    const setCookies = response.headers.getSetCookie();
    this.processSetCookies(setCookies);
    return response;
  }
}

beforeAll(async () => await migrate());

export async function setupDbForTest() {
  await db.delete(s.users);
  await db.delete(s.programs);
  await db.insert(s.users).values(Object.values(testUsers).filter((u) => u.email !== "new.user@test.com"));
  await db.insert(s.programs).values(testPrograms.existing);
}
