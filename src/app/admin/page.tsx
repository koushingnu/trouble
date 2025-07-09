"use client";

export default function AdminPage() {
  const subs = [
    {
      id: 1,
      subscriptionId: "sub_123",
      customerId: "cus_456",
      status: "active",
      currentPeriodEnd: "2024-04-15",
      updatedAt: "2024-03-15",
    },
    {
      id: 2,
      subscriptionId: "sub_789",
      customerId: "cus_012",
      status: "suspended",
      currentPeriodEnd: "2024-04-10",
      updatedAt: "2024-03-10",
    },
  ];

  const logs = [
    {
      id: 1,
      createdAt: "2024-03-15 10:00:00",
      eventType: "subscription.created",
      status: "processed",
      signatureValid: true,
      error: null,
      rawData: JSON.stringify({ event: "subscription.created", data: {} }),
    },
    {
      id: 2,
      createdAt: "2024-03-14 15:30:00",
      eventType: "subscription.updated",
      status: "error",
      signatureValid: true,
      error: "処理に失敗しました",
      rawData: JSON.stringify({ event: "subscription.updated", data: {} }),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">管理ページ</h1>

      {/* サブスクリプション一覧 */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">
          サブスクリプション一覧（全{subs.length}件）
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  顧客ID
                </th>
                <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  期限
                </th>
                <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  更新日時
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {subs.map((sub) => (
                <tr key={sub.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {sub.subscriptionId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sub.customerId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold
                      ${
                        sub.status === "active"
                          ? "bg-green-100 text-green-800"
                          : sub.status === "suspended"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sub.currentPeriodEnd}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sub.updatedAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Webhookログ一覧 */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">
          Webhookログ（全{logs.length}件）
        </h2>
        <div className="space-y-4">
          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-white p-6 rounded-lg shadow border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold
                    ${
                      log.status === "processed"
                        ? "bg-green-100 text-green-800"
                        : log.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {log.status}
                  </span>
                  <span className="text-sm text-gray-500">{log.createdAt}</span>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold
                  ${
                    log.signatureValid
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  署名: {log.signatureValid ? "有効" : "無効"}
                </span>
              </div>
              <div className="mb-2">
                <span className="font-semibold">イベント:</span> {log.eventType}
              </div>
              {log.error && (
                <div className="mb-2 text-red-600">
                  <span className="font-semibold">エラー:</span> {log.error}
                </div>
              )}
              <div className="mt-4">
                <details className="text-sm">
                  <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                    詳細データを表示
                  </summary>
                  <pre className="mt-2 p-4 bg-gray-50 rounded overflow-x-auto">
                    {JSON.stringify(JSON.parse(log.rawData), null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
