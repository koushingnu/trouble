"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import AdminTable from "../../components/AdminTable";
import { User } from "../../types";
import { Column } from "../../components/AdminTable";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("ユーザー一覧の取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "REVOKED":
        return "bg-red-100 text-red-800";
      case "UNUSED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case "ACTIVE":
        return "使用中";
      case "REVOKED":
        return "無効";
      case "UNUSED":
        return "未使用";
      default:
        return "未設定";
    }
  };

  const handleCSVDownload = async () => {
    try {
      const response = await fetch("/api/users/csv");
      if (!response.ok) {
        throw new Error("CSVのダウンロードに失敗しました");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "users.csv";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("CSV download error:", error);
      toast.error("CSVのダウンロードに失敗しました");
    }
  };

  const columns: Column<User>[] = [
    { key: "id", label: "ID", width: 80 },
    {
      key: "email",
      label: "メールアドレス",
      width: 300,
    },
    {
      key: "id", // ダミーのキーを使用
      label: "ステータス",
      width: 120,
      align: "center",
      format: (_, row) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
            row.token?.status || null
          )}`}
        >
          {getStatusLabel(row.token?.status || null)}
        </span>
      ),
    },
    {
      key: "id", // ダミーのキーを使用
      label: "認証キー",
      width: 300,
      format: (_, row) => row.token?.token_value || "未割り当て",
    },
    {
      key: "created_at",
      label: "登録日時",
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
      <div className="overflow-x-auto">
        <AdminTable
          title="ユーザー一覧"
          isLoading={isLoading}
          onRefresh={fetchUsers}
          columns={columns}
          data={users}
          emptyMessage="ユーザーが登録されていません"
          actionButton={
            <button
              onClick={handleCSVDownload}
              className="inline-flex items-center px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors"
            >
              <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
              CSVダウンロード
            </button>
          }
        />
      </div>
    </div>
  );
}
