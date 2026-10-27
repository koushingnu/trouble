import Link from "next/link";
import Footer from "@/components/Footer";
import LogoHeader from "@/components/LogoHeader";

type Article = {
  title: string;
  paragraphs: string[];
  list?: string[];
};

type Chapter = {
  title: string;
  articles: Article[];
};

const chapters: Chapter[] = [
  {
    title: "第1章　総則",
    articles: [
      {
        title: "第1条（規約の適用）",
        paragraphs: [
          "本規約は、本サービスの提供条件および利用に関する基本事項を定めるものとします。",
          "当社は、法令改正、運営方針の変更その他合理的な理由がある場合、会員の事前承諾を得ることなく本規約を変更できるものとします。",
          "変更後の規約は当社ウェブサイトへの掲載等により告知し、掲載後に会員が本サービスを利用した場合、当該変更に同意したものとみなします。",
        ],
      },
      {
        title: "第2条（用語の定義）",
        paragraphs: [
          "「会員」とは、本規約および特定商取引法に基づく表示内容に同意のうえ、当社所定の申込み手続きを完了し、当社が入会を承認した個人または法人をいいます。",
          "本サービスは月額制の継続課金サービス（サブスクリプション）であり、解約手続きが完了しない限り契約は自動更新されます。",
        ],
      },
      {
        title: "第3条（サービスの利用）",
        paragraphs: [
          "会員は、本規約および関連規定を遵守することを条件として、本サービスを利用できます。",
          "当社は、サービスの性質上、提供内容や対応範囲を合理的な範囲で変更する場合があります。",
        ],
      },
      {
        title: "第4条（権利の譲渡禁止）",
        paragraphs: [
          "会員は、本サービスに関する契約上の地位または権利義務を第三者に譲渡できません。",
        ],
      },
      {
        title: "第5条（会費・支払方法）",
        paragraphs: [
          "本サービスの会費、支払方法、支払時期等は、当社が別途定める特定商取引法に基づく表示に従うものとします。",
          "会費は月額制とし、理由の如何を問わず既に支払われた会費は返金されません。",
          "解約は所定の方法で行うものとし、解約完了月の末日までの会費が発生します。",
        ],
      },
      {
        title: "第6条（契約期間・自動更新）",
        paragraphs: [
          "本サービスの契約期間は1か月単位とし、会員による解約手続きが完了しない限り同一条件にて自動更新されます。",
          "日割り計算による返金は行いません。",
        ],
      },
      {
        title: "第7条（解約・退会）",
        paragraphs: [
          "会員は、当社所定の解約方法によりいつでも本サービスを解約することができます。",
          "解約申請の締切日および解約の効力発生日は、特定商取引法に基づく表示に従うものとします。",
        ],
      },
      {
        title: "第8条（登録情報の変更）",
        paragraphs: [
          "会員は、登録情報に変更があった場合、速やかに当社所定の方法で届け出るものとします。",
        ],
      },
      {
        title: "第9条（反社会的勢力の排除）",
        paragraphs: [
          "会員は、反社会的勢力に該当しないことを保証し、違反が判明した場合、当社は事前通知なく契約を解除できます。",
        ],
      },
      {
        title: "第10条（個人情報の取扱い）",
        paragraphs: [
          "当社は、個人情報保護法その他関係法令を遵守し、本サービスの提供および運営に必要な範囲で個人情報を利用します。",
        ],
      },
      {
        title: "第11条（免責およびサービスの性質）",
        paragraphs: [
          "本サービスは問題解決のための情報提供および助言を行うものであり、特定の結果や解決を保証するものではありません。",
          "本サービスは法律相談、代理交渉その他の法律行為を行うものではありません。",
        ],
      },
      {
        title: "第12条（合意管轄）",
        paragraphs: [
          "本規約に関して生じた紛争については、東京地方裁判所を第一審の専属管轄裁判所とします。",
        ],
      },
    ],
  },
  {
    title: "第2章　近隣トラブル解決支援サービス",
    articles: [
      {
        title: "第13条（サービス内容）",
        paragraphs: [
          "当社は、近隣トラブル、つきまとい行為、不法侵入、SNSトラブル等に関する初期対応の助言および相談先の案内を行います。",
        ],
      },
      {
        title: "第14条（対応範囲および制限）",
        paragraphs: [
          "本サービスは情報提供を目的とするものであり、会員に代わって交渉・介入することはありません。",
          "会員期間開始前に発生したトラブルや、当社が不適切と判断した内容は対象外とします。",
        ],
      },
      {
        title: "第15条（相談方法・受付時間）",
        paragraphs: [
          "相談は会員専用窓口を通じて行うものとします。",
          "受付時間は平日10:00～18:30（土日祝日および年末年始を除く）とします。",
        ],
      },
      {
        title: "第16条（契約解除およびサービス停止）",
        paragraphs: [
          "会員が本規約に違反した場合、当社は事前通知なくサービス提供を停止または契約を解除できます。",
        ],
      },
      {
        title: "第17条（準拠法）",
        paragraphs: ["本規約は日本法に準拠します。"],
      },
      {
        title: "第18条（損害賠償の制限）",
        paragraphs: [
          "当社の故意または重過失による場合を除き、本サービスの利用に関連して会員に生じた損害について、当社が負う責任は、当該会員が直近1か月に支払った本サービスの利用料金の額を上限とします。",
        ],
      },
      {
        title: "第19条（AIサービスに関する免責）",
        paragraphs: [
          "本サービスの一部にはAI（人工知能）による自動応答または情報提供機能が含まれる場合があります。",
          "AIによる回答は一般情報を基に生成される参考情報であり、その正確性、完全性、最新性、特定目的への適合性を保証するものではありません。",
          "会員はAIによる回答を自己責任で利用するものとします。",
          "本サービスは法律相談、医療相談その他の専門的助言を提供するものではありません。",
        ],
      },
      {
        title: "第20条（利用制限および相談拒否）",
        paragraphs: [
          "当社は、会員による本サービスの利用が以下のいずれかに該当すると判断した場合、事前通知なく相談対応の拒否、サービス利用の制限、または会員資格の停止もしくは契約解除を行うことができます。",
        ],
        list: [
          "1. 法令または公序良俗に反する相談",
          "2. 犯罪行為または違法行為に関連する相談",
          "3. 第三者への誹謗中傷や嫌がらせを目的とする相談",
          "4. 本サービスの運営を妨害する行為",
          "5. 同一または類似内容の相談を過度に繰り返す行為",
          "6. 虚偽情報の提供",
          "7. その他、当社が不適切と判断した行為",
        ],
      },
    ],
  },
];

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#ACE0F9] to-[#64B3F4]">
      {/* ヘッダー */}
      <LogoHeader />

      {/* メインコンテンツ */}
      <main className="flex-1 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#FDFDFD] rounded-3xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              会員利用規約
            </h1>

            <div className="space-y-8 text-gray-800">
              <p className="leading-relaxed">
                本規約は、株式会社メディアサービス（以下「当社」といいます）が提供する、月額課金型の近隣トラブル等解決支援サービス「トラブル解決ラボ」（以下「本サービス」といいます）の利用条件を定めるものです。
              </p>

              {chapters.map((chapter) => (
                <section key={chapter.title} className="space-y-6">
                  <h2 className="text-xl font-bold text-[#1888CF]">
                    {chapter.title}
                  </h2>
                  {chapter.articles.map((article) => (
                    <div key={article.title}>
                      <h3 className="text-lg font-bold mb-3">
                        {article.title}
                      </h3>
                      <div className="space-y-2 leading-relaxed">
                        {article.paragraphs.map((p) => (
                          <p key={p}>{p}</p>
                        ))}
                      </div>
                      {article.list && (
                        <div className="space-y-2 ml-4 mt-3">
                          {article.list.map((item) => (
                            <p key={item}>{item}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </section>
              ))}

              <p className="text-right text-sm text-gray-600">
                最終改定日：2026年3月1日
              </p>
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
