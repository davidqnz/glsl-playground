import type { ApiError, UserToken } from "../../common/api-types";
import type { Result } from "../../common/result";
import apiPrefix from "./api-prefix";

export async function getUser(): Promise<Result<UserToken | null>> {
  const response = await fetch(`${apiPrefix}/users/me`);
  const json: unknown = await response.json();

  if (!response.ok) return new Error((json as ApiError).message);

  return json as UserToken | null;
}

export async function logIn(email: string, password: string): Promise<Result<UserToken>> {
  const response = await fetch(`${apiPrefix}/users/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  const json: unknown = await response.json();

  if (!response.ok) return new Error((json as ApiError).message);

  return json as UserToken;
}

export async function signUp(email: string, password: string): Promise<Result<UserToken>> {
  const response = await fetch(`${apiPrefix}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  const json: unknown = await response.json();

  if (!response.ok) return new Error((json as ApiError).message);

  return json as UserToken;
}

export async function logOut(): Promise<Result<true>> {
  const response = await fetch(`${apiPrefix}/users/sessions`, {
    method: "DELETE",
  });
  return response.ok ? true : new Error("Failed to log out.");
}
