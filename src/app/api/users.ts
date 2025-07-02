import { User, ApiResponse } from "../types";

const API_BASE = "/api/proxy";

export async function getUsers(): Promise<User[]> {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function getUser(id: number): Promise<User> {
  const res = await fetch(`${API_BASE}?id=${id}`);
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

export async function createUser(
  name: string,
  email: string
): Promise<ApiResponse> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email }),
  });

  if (!res.ok) throw new Error("Failed to create user");
  return res.json();
}
