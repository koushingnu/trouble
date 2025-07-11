"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import AdminTable from "../../components/AdminTable";
import { User } from "../../types";
import { Column } from "../../components/AdminTable";

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/proxy/users");
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

  const getStatusLabel = (status: string | null) => {
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

  const columns: Column<User>[] = [
    { key: "id", label: "ID", width: 80 },
    {
      key: "email",
      label: "メールアドレス",
      width: 300,
    },
    {
      key: "status",
      label: "ステータス",
      width: 120,
      align: "center",
      format: (value) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
            value as string | null
          )}`}
        >
          {getStatusLabel(value as string | null)}
        </span>
      ),
    },
    {
      key: "token_value",
      label: "認証キー",
      width: 300,
      format: (value) => (value as string | null) || "未割り当て",
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
