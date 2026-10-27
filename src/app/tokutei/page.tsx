import Link from "next/link";
import Footer from "@/components/Footer";
import LogoHeader from "@/components/LogoHeader";

type Item = {
  title: string;
  lines: string[];
};

const items: Item[] = [
  {
    title: "事業者の名称および連絡先",
    lines: [
      "■事業者名",
      "株式会社メディアサービス",
      "■運営責任者",
      "株式会社メディアサービス",
      "■所在地",
      "〒170-0013",
      "東京都豊島区東池袋1-25-8タカセビル3F",
      "■メールアドレス",
      "contactcenter-trouble@troublesolution-lab.com",
    ],
  },
  {
    title: "サービス名",
    lines: ["トラブル解決ラボ"],
  },
  {
    title: "販売価格",
    lines: [
      "本サービスは 月額制のサブスクリプションサービスです。",
      "月額利用料金：660円（税込）",
      "※料金は申込ページにも表示されます。",
    ],
  },
  {
    title: "無料期間について",
    lines: [
      "本サービスには 無料トライアル期間があります。決済登録月およびその翌月は無料期間となります。無料期間中に解約した場合、料金は発生しません。",
      "（例）3月10日に決済登録した場合",
      "・3月：無料",
      "・4月：無料",
      "・5月：月額課金開始",
    ],
  },
  {
    title: "商品代金以外の必要料金",
    lines: [
      "以下についてはお客様のご負担となります。",
      "・インターネット接続料金",
      "・通信費",
      "・端末費用",
    ],
  },
  {
    title: "支払方法",
    lines: ["クレジットカード決済（月額PAY決済システムを利用）"],
  },
  {
    title: "支払時期",
    lines: [
      "無料期間終了後、3か月目より月額課金が開始されます。その後は1か月ごとに自動更新（自動課金）されます。",
    ],
  },
  {
    title: "サービス提供時期",
    lines: [
      "月額PAYにて決済登録が完了後、本サービス利用に必要な以下の情報が発行されます。",
      "・認証キー",
      "・チャットサービスURL",
      "発行されたURLより会員登録を行うことで本サービスの利用が可能となります。",
    ],
  },
  {
    title: "サービス利用開始までの流れ",
    lines: [
      "① 当社より月額PAY決済URLを発行",
      "② ユーザーが月額PAYで決済登録",
      "③ 決済登録完了後認証キーとチャットURLが発行",
      "④ URLからチャットサービスの会員登録画面へ遷移",
      "⑤ 認証キーと必要情報を入力し会員登録",
      "⑥ トラブル解決ラボ利用開始",
    ],
  },
  {
    title: "解約方法",
    lines: [
      "解約は以下の手順で行います。",
      "① トラブル解決ラボのチャット内の解約リンクをクリック",
      "② 月額PAYの解約ページへ遷移",
      "③ 月額PAYにて解約手続きを完了",
    ],
  },
  {
    title: "解約期限",
    lines: [
      "当月末日までに解約手続きを行った場合、当月末日をもって契約終了となります。",
      "（例）3月31日までに解約 → 3月利用分までで終了",
    ],
  },
  {
    title: "解約後のサービス利用",
    lines: [
      "解約手続き後は当月末日をもって利用終了となります。ただしシステム処理の都合により翌月初旬までチャットサービスにアクセスできる場合がありますが追加料金は発生しません。",
    ],
  },
  {
    title: "返品・返金",
    lines: [
      "本サービスはデジタルサービスのため返品および返金には対応しておりません。",
    ],
  },
  {
    title: "サービスに関する注意事項",
    lines: [
      "本サービスはAIによる情報提供および助言を行うサービスであり、問題解決を保証するものではありません。また、本サービスは法律相談、医療相談等の専門的助言を提供するものではありません。",
    ],
  },
];

export default function Tokutei() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#ACE0F9] to-[#64B3F4]">
      {/* ヘッダー */}
      <LogoHeader />

      {/* メインコンテンツ */}
      <main className="flex-1 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#FDFDFD] rounded-3xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              特定商取引法に基づく表記
            </h1>

            <div className="space-y-8 text-gray-800">
              {items.map((item) => (
                <section key={item.title}>
                  <h2 className="text-xl font-bold mb-4 text-[#1888CF]">
                    {item.title}
                  </h2>
                  <div className="space-y-2 leading-relaxed">
                    {item.lines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/auth"
                className="text-[#1888CF] hover:underline font-medium"
              >
                ← トップページに戻る
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer maxWidth="7xl" />
    </div>
  );
}
