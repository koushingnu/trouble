"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import AdminTable from "../../components/AdminTable";
import { Token } from "../../types";
import { Column } from "../../components/AdminTable";

export default function TokenManagement() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingCount, setGeneratingCount] = useState<number>(1);

  const fetchTokens = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/proxy/tokens");
      if (!response.ok) {
        throw new Error("Failed to fetch tokens");
      }
      const data = await response.json();
      setTokens(data.data || []);
    } catch (error) {
      console.error("Error fetching tokens:", error);
      toast.error("認証キー一覧の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTokens = async () => {
    if (generatingCount < 1 || generatingCount > 10000) {
      toast.error("生成数は1から10000の間で指定してください");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/proxy/admin/tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ count: generatingCount }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "認証キー生成に失敗しました");
      }

      toast.success(`${generatingCount}個の認証キーを生成しました`);
      fetchTokens();
    } catch (error) {
      console.error("Error generating tokens:", error);
      toast.error(
        error instanceof Error ? error.message : "認証キー生成に失敗しました"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusColor = (status: Token["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-yellow-100 text-yellow-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "unused":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: Token["status"]) => {
    switch (status) {
      case "active":
        return "有効";
      case "inactive":
        return "無効";
      case "expired":
        return "期限切れ";
      case "unused":
        return "未使用";
      default:
        return "未設定";
    }
  };

  const columns: Column<Token>[] = [
    { key: "id", label: "ID", width: 80 },
    {
      key: "token_value",
      label: "認証キー",
      width: 300,
      format: (value) => String(value),
    },
    {
      key: "status",
      label: "ステータス",
      width: 120,
      align: "center",
      format: (value) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
            value as Token["status"]
          )}`}
        >
          {getStatusLabel(value as Token["status"])}
        </span>
      ),
    },
    {
      key: "user_email",
      label: "使用ユーザー",
      width: 250,
      format: (value) => (value as string | null) || "未割り当て",
    },
    {
      key: "created_at",
      label: "生成日時",
      width: 180,
      format: (value) =>
        new Date(value as string).toLocaleString("ja-JP", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 認証キー生成フォーム */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          認証キー生成
        </h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <select
              value={generatingCount}
              onChange={(e) => setGeneratingCount(Number(e.target.value))}
              className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
            >
              <option value={1}>1個</option>
              <option value={5}>5個</option>
              <option value={10}>10個</option>
              <option value={50}>50個</option>
              <option value={100}>100個</option>
              <option value={500}>500個</option>
              <option value={1000}>1,000個</option>
            </select>
          </div>
          <button
            onClick={handleGenerateTokens}
            disabled={isGenerating}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                生成中...
              </>
            ) : (
              "生成"
            )}
          </button>
        </div>
      </div>

      <AdminTable
        title="認証キー一覧"
        isLoading={loading}
        onRefresh={fetchTokens}
        columns={columns}
        data={tokens}
        emptyMessage="認証キーが登録されていません"
      />
    </div>
  );
}
