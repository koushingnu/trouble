import { User, ApiResponse } from "../types";

// ユーザー一覧の取得
export async function getUsers(): Promise<User[]> {
  const res = await fetch("/api/proxy");
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

// 特定のユーザーの取得
export async function getUser(id: number): Promise<User> {
  const res = await fetch(`/api/proxy?id=${id}`);
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

// 新規ユーザーの作成
export async function createUser(
  email: string,
  password: string,
  token: string
): Promise<ApiResponse> {
  const res = await fetch("/api/proxy", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      token,
    }),
  });

  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(errorData.error || "Failed to create user");
  }
  return res.json();
}
