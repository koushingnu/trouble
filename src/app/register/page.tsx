"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (password !== confirmPassword) {
      toast.error("パスワードが一致しません");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, token }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "登録に失敗しました");
      }

      toast.success("登録が完了しました");
      router.push("/auth");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("登録に失敗しました");
      }
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" align="center" sx={{ my: 4 }}>
        新規会員登録
      </Typography>

      <Paper sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              label="メールアドレス"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="パスワード"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="パスワード（確認）"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="認証キー"
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
              fullWidth
            />

            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              fullWidth
              size="large"
            >
              {isLoading ? "登録中..." : "登録"}
            </Button>

            <Button
              variant="text"
              onClick={() => router.push("/auth")}
              fullWidth
            >
              ログインページへ戻る
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
