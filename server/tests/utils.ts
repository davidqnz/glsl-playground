import { db } from "../database/db.js";
import bcrypt from "bcrypt";
import environment from "../environment.js";

export const setCookieRegex = new RegExp(`^${environment.SESSION_COOKIE}=(\\S+);`);
export const clearCookieRegex = new RegExp(`^${environment.SESSION_COOKIE}=;`);

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

export async function setupDbForTest() {
  await db.deleteFrom("users").execute();
  await db.deleteFrom("programs").execute();
  await db
    .insertInto("users")
    .values(Object.values(testUsers).filter((u) => u.email !== "new.user@test.com"))
    .execute();
  await db.insertInto("programs").values(testPrograms.existing).execute();
}
