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
  productName: string;
  authKey: string;
  customerId: string;
  phoneNumber: string;
  status: string;
  statusMapped: "ACTIVE" | "REVOKED" | "UNUSED";
  cancelledDate: string;
  keyToUse: string;
  isFiltered: boolean;
  skipReason?: string;
  customerName?: string;
}

interface ConfirmResult {
  success: boolean;
  message: string;
  results: {
    total: number;
    success: number;
    failed: number;
    created: number;
    updated: number;
    skipped: number;
    phoneUpdated: number;
    errors: Array<{ authKey: string; error: string }>;
  };
}

export default function CsvImport() {
  const [isUploading, setIsUploading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportStats | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData[]>([]);
  const [confirmResult, setConfirmResult] = useState<ConfirmResult | null>(null);
  const [showOnlyFiltered, setShowOnlyFiltered] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // CSVファイルかチェック
      if (!file.name.endsWith(".csv")) {
        toast.error("CSVファイルを選択してください");
        return;
      }
      setSelectedFile(file);
      setImportResult(null);
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
    setConfirmResult(null);
  };

  const handleConfirmImport = async () => {
    if (!extractedData || extractedData.length === 0) {
      toast.error("登録するデータがありません");
      return;
    }

    // フィルタされたレコード（isFiltered = true）のみを登録
    const filteredRecords = extractedData
      .filter((data) => data.isFiltered)
      .map((data) => ({
        authKey: data.keyToUse,
        phoneNumber: data.phoneNumber,
        status: data.statusMapped,
        cancelledDate: data.cancelledDate,
      }));

    if (filteredRecords.length === 0) {
      toast.error("登録対象のレコードがありません");
      return;
    }

    const confirmed = window.confirm(
      `${filteredRecords.length}件のレコードをDBに登録します。よろしいですか？`
    );

    if (!confirmed) {
      return;
    }

    setIsConfirming(true);
    try {
      const response = await fetch("/api/admin/import-csv/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ records: filteredRecords }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "登録に失敗しました");
      }

      setConfirmResult(result);
      toast.success(
        `✅ 登録完了: 成功 ${result.results.success}件 / 失敗 ${result.results.failed}件`
      );
    } catch (error: any) {
      console.error("Confirm error:", error);
      toast.error(error.message || "登録に失敗しました");
    } finally {
      setIsConfirming(false);
    }
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
            <li className="text-xs text-blue-700 mt-2">
              ※ Shift-JISまたはUTF-8エンコーディングに対応
            </li>
          </ul>
        </div>

        {/* アップロードエリア */}
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6">
          <div className="text-center">
            <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
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
            {selectedFile && (
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
              ※ まず抽出結果をプレビューします。確認後、「DBに登録」ボタンで登録してください。
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

              {/* 登録ボタンとフィルター切り替え */}
              <div className="mb-4 space-y-4">
                {/* 登録ボタン */}
                {!confirmResult && (
                  <div className="flex items-center justify-center">
                    <button
                      onClick={handleConfirmImport}
                      disabled={isConfirming || importResult.filtered === 0}
                      className="px-6 py-3 bg-[#1888CF] text-white rounded-lg hover:bg-[#1568a8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 shadow-md"
                    >
                      {isConfirming ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>登録中...</span>
                        </>
                      ) : (
                        <>
                          <ArrowUpTrayIcon className="w-5 h-5" />
                          <span>
                            DBに登録（{importResult.filtered}件）
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* フィルター切り替え */}
                <div className="flex items-center justify-between">
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
                          退会日
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
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                            {data.cancelledDate || "-"}
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

        {/* 登録結果 */}
        {confirmResult && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm mt-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                登録結果
              </h3>
            </div>
            <div className="p-6">
              {/* 統計サマリー */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {confirmResult.results.total}
                  </div>
                  <div className="text-sm text-gray-600">処理数</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {confirmResult.results.success}
                  </div>
                  <div className="text-sm text-gray-600">成功</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {confirmResult.results.created}
                  </div>
                  <div className="text-sm text-gray-600">新規作成</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {confirmResult.results.updated}
                  </div>
                  <div className="text-sm text-gray-600">更新</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {confirmResult.results.skipped}
                  </div>
                  <div className="text-sm text-gray-600">スキップ</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {confirmResult.results.failed}
                  </div>
                  <div className="text-sm text-gray-600">失敗</div>
                </div>
              </div>

              {/* 詳細情報 */}
              <div className="space-y-4">
                {confirmResult.results.skipped > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-800">
                      ⏭️  {confirmResult.results.skipped}
                      件のレコードはステータスに変更がなかったためスキップされました
                    </p>
                  </div>
                )}
                {confirmResult.results.phoneUpdated > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      📞 電話番号を{confirmResult.results.phoneUpdated}
                      件更新しました（未設定のユーザーのみ）
                    </p>
                  </div>
                )}

                {/* エラー詳細 */}
                {confirmResult.results.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-red-900 mb-2">
                      エラー詳細
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {confirmResult.results.errors.map((error, index) => (
                        <div
                          key={index}
                          className="text-sm text-red-800 bg-white rounded p-2"
                        >
                          <span className="font-mono text-xs">
                            {error.authKey}
                          </span>
                          : {error.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 成功メッセージ */}
                {confirmResult.results.failed === 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800 font-semibold">
                      ✅ すべてのレコードが正常に登録されました！
                    </p>
                  </div>
                )}
              </div>

              {/* 完了ボタン */}
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleClearResult}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
