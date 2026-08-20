"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import AdminTable from "../../components/AdminTable";
import { Company } from "../../types";
import { Column } from "../../components/AdminTable";

export default function CompanyManagement() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [cancellationUrl, setCancellationUrl] = useState("");

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/companies", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch companies");
      }
      const data = await response.json();
      setCompanies(data.data || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast.error("卸先会社一覧の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setCode("");
    setName("");
    setCancellationUrl("");
  };

  const handleStartEdit = (company: Company) => {
    setEditingId(company.id);
    setCode(company.code);
    setName(company.name);
    setCancellationUrl(company.cancellation_url);
  };

  const handleSubmit = async () => {
    if (!code.trim() || !name.trim() || !cancellationUrl.trim()) {
      toast.error("コード・会社名・解約URLは必須です");
      return;
    }

    setIsSubmitting(true);
    try {
      const isEditing = editingId !== null;
      const response = await fetch(
        isEditing ? `/api/companies/${editingId}` : "/api/companies",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isEditing
              ? { name, cancellation_url: cancellationUrl }
              : { code, name, cancellation_url: cancellationUrl }
          ),
        }
      );

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "保存に失敗しました");
      }

      toast.success(isEditing ? "卸先会社を更新しました" : "卸先会社を作成しました");
      resetForm();
      await fetchCompanies();
    } catch (error) {
      console.error("Error saving company:", error);
      toast.error(error instanceof Error ? error.message : "保存に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (company: Company) => {
    if (!confirm(`「${company.name}」を削除しますか？`)) return;

    try {
      const response = await fetch(`/api/companies/${company.id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "削除に失敗しました");
      }
      toast.success("卸先会社を削除しました");
      await fetchCompanies();
    } catch (error) {
      console.error("Error deleting company:", error);
      toast.error(error instanceof Error ? error.message : "削除に失敗しました");
    }
  };

  const columns: Column<Company>[] = [
    { key: "id", label: "ID", width: 60 },
    { key: "code", label: "コード", width: 120 },
    { key: "name", label: "会社名", width: 200 },
    {
      key: "cancellation_url",
      label: "解約URL",
      width: 300,
      format: (value) => (
        <span className="text-xs text-gray-600 break-all">
          {String(value)}
        </span>
      ),
    },
    {
      key: "token_count",
      label: "発行キー数",
      width: 100,
      align: "center",
      format: (value) => String(value ?? 0),
    },
    {
      key: "id",
      label: "操作",
      width: 140,
      format: (_value, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleStartEdit(row)}
            className="text-xs text-[#1888CF] hover:underline"
          >
            編集
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="text-xs text-red-600 hover:underline"
          >
            削除
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="px-6 py-6">
      {/* 卸先会社 追加/編集フォーム */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {editingId ? "卸先会社を編集" : "卸先会社を追加"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              コード（認証キーの語尾）
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={editingId !== null}
              placeholder="例: ABC"
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#1888CF] focus:ring-[#1888CF] text-sm py-2 disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              会社名
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 株式会社サンプル"
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#1888CF] focus:ring-[#1888CF] text-sm py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              解約URL
            </label>
            <input
              type="text"
              value={cancellationUrl}
              onChange={(e) => setCancellationUrl(e.target.value)}
              placeholder="https://..."
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#1888CF] focus:ring-[#1888CF] text-sm py-2"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-[#1888CF] hover:bg-[#1568a8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1888CF] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {isSubmitting ? "保存中..." : editingId ? "更新" : "追加"}
          </button>
          {editingId && (
            <button
              onClick={resetForm}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
          )}
        </div>
      </div>

      <AdminTable
        title="卸先会社一覧"
        isLoading={loading}
        onRefresh={fetchCompanies}
        columns={columns}
        data={companies}
        emptyMessage="卸先会社が登録されていません"
      />
    </div>
  );
}
