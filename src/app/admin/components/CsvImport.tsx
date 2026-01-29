"use client";

import { useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { ArrowUpTrayIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

interface ImportStats {
  total: number;
  filtered: number;
  skipped: number;
  details: string[];
}

interface ExtractedData {
  rowNumber: number;
  customerName: string;
  productName: string;
  authKey: string;
  customerId: string;
  phoneNumber: string;
  status: string;
  statusMapped: "ACTIVE" | "REVOKED" | "UNUSED";
  keyToUse: string;
  isFiltered: boolean;
  skipReason?: string;
}

export default function CsvImport() {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportStats | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData[]>([]);
  const [showOnlyFiltered, setShowOnlyFiltered] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    // CSVファイルかチェック
    if (!file.name.endsWith(".csv")) {
      toast.error("CSVファイルを選択してください");
      return;
    }
    setSelectedFile(file);
    setImportResult(null);
    setExtractedData([]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("ファイルを選択してください");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/admin/import-csv", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "アップロードに失敗しました");
      }

      setImportResult(result.stats);
      setExtractedData(result.extractedData || []);
      toast.success(
        `✅ 抽出完了: 対象レコード ${result.stats.filtered}件 / スキップ ${result.stats.skipped}件`
      );

      // ファイル選択をリセット
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "アップロードに失敗しました");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearResult = () => {
    setImportResult(null);
    setExtractedData([]);
  };

  const getStatusBadgeColor = (status: string) => {
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

  const getStatusLabel = (status: string) => {
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

  const displayData = showOnlyFiltered
    ? extractedData.filter((d) => d.isFiltered)
    : extractedData;

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            CSVインポート
          </h2>
          <p className="text-sm text-gray-600">
            契約情報CSVをアップロードして、認証キーとステータスを一括登録・更新できます。
          </p>
        </div>

        {/* CSVフォーマット説明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
            <DocumentTextIcon className="w-5 h-5 mr-2" />
            CSVフォーマット
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • <strong>商品名</strong>: 「トラブル解決ラボ」のみ抽出（8列目）
            </li>
            <li>
              • <strong>認証キー</strong>または<strong>顧客ID</strong>:
              どちらか必須（15列目または13列目）
            </li>
            <li>• <strong>電話番号</strong>: 任意（12列目、ハイフンなし10-11桁）</li>
            <li>
              • <strong>ステータス</strong>: 承認/契約 → 使用中、退会/解約 →
              無効、その他 → 未使用（6列目）
            </li>
            <li className="mt-2 text-xs text-blue-700">
              ⚠️ 現在はプレビューモードです。DBには登録されません。
            </li>
            <li className="text-xs text-blue-700">
              ※ Shift-JISまたはUTF-8エンコーディングに対応
            </li>
          </ul>
        </div>

        {/* アップロードエリア（ドラッグ&ドロップ対応） */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`bg-white border-2 border-dashed rounded-lg p-8 mb-6 transition-colors ${
            isDragging
              ? "border-[#1888CF] bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <div className="text-center">
            <ArrowUpTrayIcon
              className={`mx-auto h-12 w-12 mb-4 transition-colors ${
                isDragging ? "text-[#1888CF]" : "text-gray-400"
              }`}
            />
            {isDragging ? (
              <p className="text-lg font-semibold text-[#1888CF] mb-4">
                ファイルをドロップしてください
              </p>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  CSVファイルをドラッグ&ドロップ
                  <br />
                  または
                </p>
                <div className="mb-4">
                  <label
                    htmlFor="csv-file-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#1888CF] hover:bg-[#1565A0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1888CF]"
                  >
                    <DocumentTextIcon className="w-5 h-5 mr-2" />
                    CSVファイルを選択
                  </label>
                  <input
                    ref={fileInputRef}
                    id="csv-file-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </>
            )}
            {selectedFile && !isDragging && (
              <div className="text-sm text-gray-600 mb-4">
                選択中: <strong>{selectedFile.name}</strong> (
                {(selectedFile.size / 1024).toFixed(2)} KB)
              </div>
            )}
            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white ${
                !selectedFile || isUploading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
            >
              {isUploading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                  アップロード中...
                </>
              ) : (
                <>
                  <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
                  解析してプレビュー
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 mt-2">
              ※ DBには登録されません。抽出結果のプレビューのみ表示されます。
            </p>
          </div>
        </div>

        {/* 抽出結果 */}
        {importResult && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                抽出結果（プレビュー）
              </h3>
              <button
                onClick={handleClearResult}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ✕ 閉じる
              </button>
            </div>
            <div className="p-6">
              {/* 統計サマリー */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {importResult.total}
                  </div>
                  <div className="text-sm text-gray-600">総レコード数</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {importResult.filtered}
                  </div>
                  <div className="text-sm text-gray-600">
                    対象レコード数
                    <br />
                    <span className="text-xs">
                      （トラブル解決ラボ）
                    </span>
                  </div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {importResult.skipped}
                  </div>
                  <div className="text-sm text-gray-600">スキップ</div>
                </div>
              </div>

              {/* フィルター切り替え */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showOnlyFiltered"
                    checked={showOnlyFiltered}
                    onChange={(e) => setShowOnlyFiltered(e.target.checked)}
                    className="rounded border-gray-300 text-[#1888CF] focus:ring-[#1888CF]"
                  />
                  <label
                    htmlFor="showOnlyFiltered"
                    className="text-sm text-gray-700"
                  >
                    対象レコードのみ表示（トラブル解決ラボ）
                  </label>
                </div>
                <div className="text-sm text-gray-600">
                  表示中: {displayData.length}件
                </div>
              </div>

              {/* 抽出データテーブル */}
              {extractedData.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          行
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          顧客名
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          商品名
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          認証キー
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          電話番号
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ステータス
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          判定
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {displayData.map((data, idx) => (
                        <tr
                          key={idx}
                          className={
                            data.isFiltered ? "" : "bg-gray-50 opacity-60"
                          }
                        >
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                            {data.rowNumber}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-900">
                            {data.customerName || (
                              <span className="text-gray-400 italic">未登録</span>
                            )}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                            {data.productName || "-"}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-900 font-mono">
                            {data.keyToUse ? (
                              <span title={data.keyToUse}>
                                {data.keyToUse.substring(0, 20)}...
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                            {data.phoneNumber || "-"}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                                data.statusMapped
                              )}`}
                            >
                              {getStatusLabel(data.statusMapped)}
                            </span>
                            <div className="text-xs text-gray-500 mt-1">
                              ({data.status || "未設定"})
                            </div>
                          </td>
                          <td className="px-3 py-4 text-sm">
                            {data.isFiltered ? (
                              <span className="text-green-600 font-semibold">
                                ✓ 対象
                              </span>
                            ) : (
                              <span className="text-yellow-600 text-xs">
                                {data.skipReason || "スキップ"}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
