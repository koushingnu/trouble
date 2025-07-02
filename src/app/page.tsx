"use client";

import { useEffect, useState } from "react";

type User = {
  id: number;
  name: string;
  email: string;
};

export default function Page() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState("");

  useEffect(() => {
    // BASIC認証がある場合
    const username = "m";
    const password = "m";
    const headers = new Headers();
    headers.set("Authorization", "Basic " + btoa(username + ":" + password));

    fetch("https://ttsv.sakura.ne.jp/get-users.php", { headers })
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const username = "m";
    const password = "m";
    const headers = new Headers();
    headers.set("Authorization", "Basic " + btoa(username + ":" + password));
    headers.set("Content-Type", "application/x-www-form-urlencoded");
    const params = new URLSearchParams();
    params.append("name", name);
    params.append("email", email);

    const res = await fetch("https://ttsv.sakura.ne.jp/add-user.php", {
      method: "POST",
      headers,
      body: params,
    });
    const data = await res.json();
    setResult(JSON.stringify(data));
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-8">
      <h1 className="text-2xl font-bold mb-4">ユーザー一覧</h1>

      <form onSubmit={handleAdd} className="mb-8 w-full max-w-lg">
        <div className="flex gap-2 mb-2">
          <input
            className="border rounded px-2 py-1 flex-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="名前"
            required
          />
          <input
            className="border rounded px-2 py-1 flex-1"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="メールアドレス"
            required
          />
        </div>
        <button
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          type="submit"
        >
          ユーザーを追加
        </button>
        {result && <div className="mt-2 text-sm text-gray-600">{result}</div>}
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="w-full max-w-lg">
          {users.map((user) => (
            <li
              key={user.id}
              className="bg-white p-4 rounded-xl shadow mb-2 flex justify-between"
            >
              <span>{user.name}</span>
              <span className="text-gray-400">{user.email}</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
