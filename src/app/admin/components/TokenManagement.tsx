"use client";

import { useState, useEffect } from "react";
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
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { toast } from "react-hot-toast";
import { Token } from "../../types";

// トークンのステータスに応じたラベルを返す
function getStatusLabel(status: string) {
  const labels: { [key: string]: string } = {
    unused: "未使用",
    active: "使用中",
    inactive: "非アクティブ",
    expired: "期限切れ",
    invalid: "無効",
  };
  return labels[status] || status;
}

// トークンのステータスに応じた色を返す
function getStatusColor(status: string) {
  const colors: {
    [key: string]:
      | "default"
      | "primary"
      | "secondary"
      | "error"
      | "info"
      | "success"
      | "warning";
  } = {
    unused: "success",
    active: "primary",
    inactive: "default",
    expired: "error",
    invalid: "error",
  };
  return colors[status] || "default";
}

export default function TokenManagement() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [generatingCount, setGeneratingCount] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState(false);

  // トークン一覧を取得
  const fetchTokens = async () => {
    try {
      const response = await fetch("/api/proxy/tokens");
      if (!response.ok) {
        throw new Error("Failed to fetch tokens");
      }
      const data = await response.json();
      setTokens(data.data || []);
    } catch (error) {
      console.error("Error fetching tokens:", error);
      toast.error("トークン一覧の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  // トークンを生成
  const handleGenerateTokens = async () => {
    if (generatingCount < 1 || generatingCount > 10000) {
      toast.error("生成数は1から10000の間で指定してください");
      return;
    }

    setIsGenerating(true);
    try {
      console.log("トークン生成リクエスト:", { count: generatingCount });

      const response = await fetch("/api/proxy/admin/tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ count: generatingCount }),
      });

      const responseText = await response.text();
      console.log("トークン生成レスポンス:", {
        status: response.status,
        body: responseText,
      });

      if (!response.ok) {
        let errorMessage = "トークン生成に失敗しました";
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error("エラーレスポンスのパースに失敗:", e);
        }
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("レスポンスのパースに失敗:", e);
        throw new Error("不正なレスポンス形式です");
      }

      if (!data.success) {
        throw new Error(data.error || "トークン生成に失敗しました");
      }

      toast.success(`${generatingCount}個のトークンを生成しました`);
      fetchTokens(); // 一覧を更新
    } catch (error) {
      console.error("トークン生成エラー:", error);
      toast.error(
        error instanceof Error ? error.message : "トークン生成に失敗しました"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  // フィルタリングと検索を適用
  const filteredTokens = tokens.filter((token) => {
    const matchesStatus =
      statusFilter === "all" || token.status === statusFilter;
    const matchesSearch =
      searchQuery === "" ||
      token.token_value.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (token.user_email &&
        token.user_email.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        トークン管理
      </Typography>

      {/* トークン生成フォーム */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          トークン生成
        </Typography>
        <Stack spacing={2}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <FormControl sx={{ width: 200 }}>
              <InputLabel>生成数</InputLabel>
              <Select
                value={generatingCount}
                label="生成数"
                onChange={(e) => setGeneratingCount(Number(e.target.value))}
              >
                <MenuItem value={1}>1個</MenuItem>
                <MenuItem value={5}>5個</MenuItem>
                <MenuItem value={10}>10個</MenuItem>
                <MenuItem value={50}>50個</MenuItem>
                <MenuItem value={100}>100個</MenuItem>
                <MenuItem value={500}>500個</MenuItem>
                <MenuItem value={1000}>1,000個</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={handleGenerateTokens}
              disabled={isGenerating}
              sx={{ minWidth: 120 }}
            >
              {isGenerating ? "生成中..." : "生成"}
            </Button>
          </Box>
          <Typography variant="caption" color="text.secondary">
            ※ 生成したトークンは自動的に一覧に追加されます
          </Typography>
        </Stack>
      </Paper>

      {/* フィルターと検索 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>ステータス</InputLabel>
            <Select
              value={statusFilter}
              label="ステータス"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">すべて</MenuItem>
              <MenuItem value="unused">未使用</MenuItem>
              <MenuItem value="active">使用中</MenuItem>
              <MenuItem value="inactive">非アクティブ</MenuItem>
              <MenuItem value="expired">期限切れ</MenuItem>
              <MenuItem value="invalid">無効</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="検索"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="トークンまたはメールアドレスで検索"
            sx={{ flexGrow: 1 }}
          />
          <Button variant="outlined" onClick={() => fetchTokens()}>
            更新
          </Button>
        </Stack>
      </Paper>

      {/* トークン一覧 */}
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>トークン</TableCell>
              <TableCell>ステータス</TableCell>
              <TableCell>割り当て先</TableCell>
              <TableCell>作成日時</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTokens.length > 0 ? (
              filteredTokens.map((token) => (
                <TableRow key={token.id}>
                  <TableCell>{token.id}</TableCell>
                  <TableCell>{token.token_value}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(token.status)}
                      color={getStatusColor(token.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{token.user_email || "-"}</TableCell>
                  <TableCell>
                    {new Date(token.created_at).toLocaleString("ja-JP")}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  {loading ? "読み込み中..." : "トークンが見つかりません"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
