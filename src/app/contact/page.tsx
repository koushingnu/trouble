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
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">お問い合わせ</h1>
              <p className="mt-2 text-sm text-gray-600">
                ご不明な点やご要望がございましたら、以下のフォームよりお問い合わせください。
                <br />
                通常2営業日以内にご返信いたします。
              </p>
            </div>

            <form className="mt-8 space-y-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    className="peer w-full border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-gray-900 placeholder-transparent focus:border-sky-600 focus:outline-none focus:ring-0"
                    placeholder="お名前"
                  />
                  <label
                    htmlFor="name"
                    className="absolute left-0 -top-3.5 text-sm text-gray-600 transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-sky-600"
                  >
                    お名前 <span className="text-red-500">*</span>
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    className="peer w-full border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-gray-900 placeholder-transparent focus:border-sky-600 focus:outline-none focus:ring-0"
                    placeholder="メールアドレス"
                  />
                  <label
                    htmlFor="email"
                    className="absolute left-0 -top-3.5 text-sm text-gray-600 transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-sky-600"
                  >
                    メールアドレス <span className="text-red-500">*</span>
                  </label>
                </div>
              </div>

              <div className="relative">
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
                    className="block w-full rounded-md border-gray-300 pr-10 focus:border-sky-600 focus:ring-sky-600 text-base"
                  >
                    <option value="">選択してください</option>
                    {subjects.map((subject) => (
                      <option key={subject.value} value={subject.value}>
                        {subject.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
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
                <div className="mt-1">
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-600 focus:ring-sky-600 sm:text-sm"
                    placeholder="お問い合わせ内容を入力してください"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                >
                  送信する
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
