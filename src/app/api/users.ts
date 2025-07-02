import { User, ApiResponse } from "../types";

export async function getUsers(): Promise<User[]> {
  const res = await fetch("/api/proxy");
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function getUser(id: number): Promise<User> {
  const res = await fetch(`/api/proxy?id=${id}`);
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

export async function createUser(
  name: string,
  email: string
): Promise<ApiResponse> {
  const res = await fetch("/api/proxy", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email }),
  });

  if (!res.ok) throw new Error("Failed to create user");
  return res.json();
}
