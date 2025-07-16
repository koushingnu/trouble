"use client";

export default function ContactPage() {
  const subjects = [
    { value: "general", label: "一般的なお問い合わせ" },
    { value: "service", label: "サービスについて" },
    { value: "account", label: "アカウントについて" },
    { value: "payment", label: "お支払いについて" },
    { value: "other", label: "その他" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <h1 className="page-title">お問い合わせ</h1>
      </div>

      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-8">
            ご不明な点やご要望がございましたら、以下のフォームよりお問い合わせください。
            <br />
            通常2営業日以内にご返信いたします。
          </p>

          <form className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  お名前 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  className="block w-full rounded-lg border border-gray-200 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 text-sm"
                  placeholder="お名前を入力してください"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  className="block w-full rounded-lg border border-gray-200 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 text-sm"
                  placeholder="メールアドレスを入力してください"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                お問い合わせ種別 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="subject"
                  name="subject"
                  required
                  className="block w-full rounded-lg border border-gray-200 px-4 py-2.5 text-gray-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 text-sm appearance-none"
                >
                  <option value="">選択してください</option>
                  {subjects.map((subject) => (
                    <option key={subject.value} value={subject.value}>
                      {subject.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                お問い合わせ内容 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                required
                className="block w-full rounded-lg border border-gray-200 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 text-sm"
                placeholder="お問い合わせ内容を入力してください"
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
              >
                送信する
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
