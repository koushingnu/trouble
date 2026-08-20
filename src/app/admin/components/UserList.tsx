"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import AdminTable from "../../components/AdminTable";
import { User, Company } from "../../types";
import { Column } from "../../components/AdminTable";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filterCompanyName, setFilterCompanyName] = useState<string>("");

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

  const fetchCompanies = async () => {
    try {
      const response = await fetch("/api/companies", { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      setCompanies(data.data || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCompanies();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!filterCompanyName) return users;
    if (filterCompanyName === "__direct__") {
      return users.filter((u) => !u.token?.company?.name);
    }
    return users.filter((u) => u.token?.company?.name === filterCompanyName);
  }, [users, filterCompanyName]);

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
    {
      key: "company_serial_number",
      label: "自社通番",
      width: 120,
      format: (value) => (value as string) || "-",
      sortable: true,
    },
    {
      key: "acquisition_source",
      label: "獲得施策",
      width: 150,
      format: (value) => (value as string) || "-",
      sortable: true,
    },
    {
      key: "id", // ダミーのキーを使用
      label: "卸先",
      width: 150,
      format: (_, row) => row.token?.company?.name || "自社（直販）",
      sortable: true,
      sortValue: (row) => row.token?.company?.name || "自社（直販）",
    },
    {
      key: "email",
      label: "メールアドレス",
      width: 220,
      sortable: true,
    },
    {
      key: "id", // ダミーのキーを使用
      label: "名前",
      width: 150,
      format: (_, row) => {
        if (row.last_name && row.first_name) {
          return `${row.last_name} ${row.first_name}`;
        }
        return "-";
      },
    },
    {
      key: "id", // ダミーのキーを使用
      label: "名前（フリガナ）",
      width: 150,
      format: (_, row) => {
        if (row.last_name_kana && row.first_name_kana) {
          return `${row.last_name_kana} ${row.first_name_kana}`;
        }
        return "-";
      },
    },
    {
      key: "phone_number",
      label: "電話番号",
      width: 130,
      format: (value) => (value as string) || "-",
    },
    {
      key: "postal_code",
      label: "郵便番号",
      width: 100,
      format: (value) => (value as string) || "-",
    },
    {
      key: "address",
      label: "住所",
      width: 250,
      format: (value) => (value as string) || "-",
    },
    {
      key: "id", // ダミーのキーを使用
      label: "会員ステータス",
      width: 120,
      align: "center",
      format: (_, row) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(
            row.token?.status || null
          )}`}
        >
          {getStatusLabel(row.token?.status || null)}
        </span>
      ),
      sortable: true,
      sortValue: (row) => row.token?.status || null,
    },
    {
      key: "id", // ダミーのキーを使用
      label: "登録日",
      width: 120,
      format: (_, row) => {
        if (!row.token?.registered_at) return "-";
        return new Date(row.token.registered_at).toLocaleDateString("ja-JP", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
      },
      sortable: true,
      sortValue: (row) =>
        row.token?.registered_at
          ? new Date(row.token.registered_at).getTime()
          : null,
    },
    {
      key: "id", // ダミーのキーを使用
      label: "退会日",
      width: 100,
      format: (_, row) => {
        if (!row.token?.cancelled_at) return "-";
        return new Date(row.token.cancelled_at).toLocaleDateString("ja-JP", {
          year: "numeric",
          month: "2-digit",
        });
      },
    },
    {
      key: "id", // ダミーのキーを使用
      label: "認証キー",
      width: 250,
      format: (_, row) => {
        const tokenValue = row.token?.token_value;
        if (!tokenValue) return "未割り当て";
        // 長い認証キーは省略表示
        if (tokenValue.length > 30) {
          return (
            <span title={tokenValue} className="cursor-help">
              {tokenValue.substring(0, 30)}...
            </span>
          );
        }
        return tokenValue;
      },
    },
    {
      key: "created_at",
      label: "登録日時",
      width: 150,
      format: (value) =>
        new Date(value as string).toLocaleString("ja-JP", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
      sortable: true,
      sortValue: (row) => new Date(row.created_at).getTime(),
    },
  ];

  return (
    <div className="px-6 py-6">
      {/* 卸先での絞り込み */}
      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm font-medium text-gray-700">
          卸先で絞り込み
        </label>
        <select
          value={filterCompanyName}
          onChange={(e) => setFilterCompanyName(e.target.value)}
          className="block w-56 rounded-lg border-gray-300 shadow-sm focus:border-[#1888CF] focus:ring-[#1888CF] text-sm py-2"
        >
          <option value="">すべて</option>
          <option value="__direct__">自社（直販）</option>
          {companies.map((company) => (
            <option key={company.id} value={company.name}>
              {company.name}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <AdminTable
          title="ユーザー一覧"
          isLoading={isLoading}
          onRefresh={fetchUsers}
          columns={columns}
          data={filteredUsers}
          emptyMessage="ユーザーが登録されていません"
          actionButton={
            <button
              onClick={handleCSVDownload}
              className="inline-flex items-center px-4 py-2 bg-[#1888CF] text-white rounded-lg hover:bg-[#1568a8] transition-colors shadow-sm"
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
