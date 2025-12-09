export default function Company() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 border-b pb-4">
          会社概要
        </h1>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              サービス名
            </h2>
            <p className="text-gray-600">トラブルまるごとレスキュー隊</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              サービス内容
            </h2>
            <p className="text-gray-600">
              生活トラブル相談サービス<br />
              近隣トラブル、住居トラブル、防犯トラブルなど、生活上のトラブル全般に関する相談を承っております。
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              お問い合わせ
            </h2>
            <p className="text-gray-600">
              詳しくはお問い合わせページからご連絡ください。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

