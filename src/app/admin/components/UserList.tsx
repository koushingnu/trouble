"use client";

import { useState, useEffect } from "react";
import { User } from "../../types";
import { toast } from "react-hot-toast";
import AdminTable from "../../components/AdminTable";

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/proxy", {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        console.error("Unexpected data structure:", data);
        throw new Error("Invalid data structure");
      }
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

  const getStatusColor = (status: User["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-yellow-100 text-yellow-800";
      case "expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: User["status"]) => {
    switch (status) {
      case "active":
        return "有効";
      case "inactive":
        return "無効";
      case "expired":
        return "期限切れ";
      default:
        return "未設定";
    }
  };

  const columns = [
    { key: "id", label: "ID", width: 80 },
    { key: "email", label: "メールアドレス" },
    { key: "token_id", label: "認証キーID", width: 120 },
    {
      key: "token_value",
      label: "認証キー",
      width: 300,
      format: (value: string | null) => value || "未設定",
    },
    {
      key: "status",
      label: "ステータス",
      width: 120,
      align: "center" as const,
      format: (value: User["status"]) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
            value
          )}`}
        >
          {getStatusLabel(value)}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "登録日時",
      width: 180,
      format: (value: string) =>
        new Date(value).toLocaleString("ja-JP", {
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
      <AdminTable
        title="ユーザー一覧"
        isLoading={isLoading}
        onRefresh={fetchUsers}
        columns={columns}
        data={users}
        emptyMessage="ユーザーが登録されていません"
      />
    </div>
  );
}
