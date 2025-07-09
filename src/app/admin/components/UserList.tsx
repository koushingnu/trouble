"use client";

import { useState, useEffect } from "react";
import { User } from "../../types";
import { getUsers, createUser } from "../../api/users";
import { toast } from "react-hot-toast";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  TextField,
  Stack,
} from "@mui/material";

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // データ取得
  const fetchUsers = async (showToast = true) => {
    try {
      const data = await getUsers();
      setUsers(data);
      if (showToast) {
        toast.success("データを取得しました");
      }
    } catch (error) {
      toast.error("データの取得に失敗しました");
      console.error("Error fetching users:", error);
    }
  };

  // 新規ユーザー登録
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !token) {
      toast.error("メールアドレス、パスワード、トークンは必須です");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createUser(email, password, token);
      if ("error" in response) {
        toast.error(response.error || "エラーが発生しました");
      } else {
        toast.success("ユーザーを追加しました");
        setEmail("");
        setPassword("");
        setToken("");
        fetchUsers(false);
      }
    } catch (error) {
      toast.error("ユーザーの追加に失敗しました");
      console.error("Error creating user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isInitialLoad) {
      fetchUsers(false);
      setIsInitialLoad(false);
    }
  }, [isInitialLoad]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        ユーザー管理
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          新規ユーザー登録
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2} sx={{ maxWidth: 400 }}>
            <TextField
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              label="メールアドレス"
              disabled={isSubmitting}
              fullWidth
              required
            />
            <TextField
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              label="パスワード"
              disabled={isSubmitting}
              fullWidth
              required
            />
            <TextField
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              label="トークン"
              disabled={isSubmitting}
              fullWidth
              required
              helperText="有効なトークンを入力してください"
            />
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              fullWidth
            >
              {isSubmitting ? "登録中..." : "登録"}
            </Button>
          </Stack>
        </form>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h6">ユーザー一覧</Typography>
          <Button variant="outlined" onClick={() => fetchUsers(true)}>
            更新
          </Button>
        </Box>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>メールアドレス</TableCell>
              <TableCell>トークンID</TableCell>
              <TableCell>トークン</TableCell>
              <TableCell>ステータス</TableCell>
              <TableCell>作成日時</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.token_id || "-"}</TableCell>
                <TableCell>{user.token_value || "-"}</TableCell>
                <TableCell>{user.status || "-"}</TableCell>
                <TableCell>
                  {new Date(user.created_at).toLocaleString("ja-JP")}
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  ユーザーが見つかりません
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
