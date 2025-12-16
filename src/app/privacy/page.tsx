import Link from "next/link";
import Image from "next/image";

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#ACE0F9] to-[#64B3F4]">
      {/* ヘッダー */}
      <header className="w-full bg-[#FDFDFD] py-4 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Link href="/auth">
            <Image
              src="/logo/logo.svg"
              alt="トラブルまるごとレスキュー隊"
              width={450}
              height={98}
              priority
              className="mx-auto w-full max-w-[200px] h-auto cursor-pointer"
            />
          </Link>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#FDFDFD] rounded-3xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              プライバシーポリシー
            </h1>

            <div className="space-y-8 text-gray-800">
              {/* 1. 個人情報の取り扱いについて */}
              <section>
                <h2 className="text-xl font-bold mb-4 text-[#1888CF]">
                  1. 個人情報の取り扱いについて
                </h2>
                <p className="leading-relaxed">
                  当社は、当社が遂行する各事業において、必要となる個人情報を取得しますが、これらの個人情報は下記の目的で利用します。
                  また、当社は、業務を円滑に進めるため、業務の一部を委託し、業務委託先に対して必要な範囲内で個人情報を提供することがありますが、
                  この場合、当社は当該委託先との間で個人情報の取扱いに関する契約の締結をはじめ、適切な監督を実施します。なお、電話応対時において、ご注文・ご意見・ご要望・お問い合わせ内容等の正確な把握、今後のサービス向上のために、通話を録音させていただく場合があります。
                </p>
              </section>

              {/* 2. 利用目的 */}
              <section>
                <h2 className="text-xl font-bold mb-4 text-[#1888CF]">
                  2. 利用目的
                </h2>
                <p className="leading-relaxed mb-4">
                  本サイトにて取得した個人情報の利用目的は、以下の通りです。
                </p>
                <div className="space-y-3 ml-4">
                  <p>
                    （1）個人情報を取扱う
                    IT通信事業、広告代理店事業、ヘルスケア事業、オフィスコンサル事業、メディア運営事業、HR事業、社内システム構築事業、VNO事業(以下「当社事業※」といいます。)における商品・サービスの提供、各事業に関するアンケート調査、お客様からのお問い合わせへの回答のため
                  </p>
                  <p>
                    （2）当社事業における商品・サービスのお知らせ及び斡旋のため
                  </p>
                  <p>（3）当社事業におけるキャンペーン等の実施のため</p>
                  <p>
                    （4）当社及び第三者の商品等の販売、販売の勧誘、発送、サービス提供のために電子メールその他の広告宣伝物を送信するため
                  </p>
                </div>
              </section>

              {/* 3. 第三者への開示・提供 */}
              <section>
                <h2 className="text-xl font-bold mb-4 text-[#1888CF]">
                  3. 第三者への開示・提供
                </h2>
                <p className="leading-relaxed mb-4">
                  当社は、業務委託先等への提供の場合、2.に記載の目的に利用する場合、及び以下の何れかに該当する場合を除き、個人情報を第三者へ開示または提供しません。
                </p>
                <div className="space-y-3 ml-4">
                  <p>(1)ご本人様の同意がある場合</p>
                  <p>
                    (2)統計的なデータなどご本人様を識別することができない状態で開示・提供する場合
                  </p>
                  <p>(3)法令に基づき開示・提供を求められた場合</p>
                  <p>
                    (4)人の生命、身体または財産の保護のために必要な場合であって、ご本人様の同意を得ることが
                    困難である場合
                  </p>
                  <p>
                    (5)国または地方公共団体等が公的な事務を実施するうえで、協力する必要がある場合であって、ご本人様の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがある場合
                  </p>
                </div>
              </section>

              {/* 4. 開示の手続 */}
              <section>
                <h2 className="text-xl font-bold mb-4 text-[#1888CF]">
                  4. 開示の手続
                </h2>
                <p className="leading-relaxed mb-4">
                  当社の開示対象個人情報に関して、ご本人様がご自身の情報の開示をご希望される場合には、法令の規定によって特別の手続が定められている場合を除き、
                  お申し出いただいた方がご本人であることを確認したうえで、合理的な期間及び範囲で、原則として書面により回答します。
                  ただし、開示することによって次のa)~c)のいずれかに該当する場合は、その全部又は一部の開示の申し出に応じられない場合があります。
                  その場合は、ご本人様に遅滞なくその旨を通知するとともに、理由を説明します。
                </p>
                <div className="space-y-2 ml-4">
                  <p>
                    a)
                    本人又は第三者の生命、身体、財産その他の権利利益を害するおそれがある場合
                  </p>
                  <p>
                    b) 当社の業務の適正な実施に著しい支障を及ぼすおそれがある場合
                  </p>
                  <p>c) 法令に違反することとなる場合</p>
                </div>
              </section>

              {/* 5. 利用目的の通知 */}
              <section>
                <h2 className="text-xl font-bold mb-4 text-[#1888CF]">
                  5. 利用目的の通知
                </h2>
                <p className="leading-relaxed">
                  当社は、本人から、当該本人が識別される開示対象個人情報について、利用目的の通知を求められた場合には、
                  お申し出いただいた方がご本人であることを確認したうえで、利用目的を通知します。
                </p>
              </section>

              {/* 6. 訂正・削除等 */}
              <section>
                <h2 className="text-xl font-bold mb-4 text-[#1888CF]">
                  6. 訂正・削除等
                </h2>
                <p className="leading-relaxed">
                  当社の開示対象個人情報の内容に関して、ご本人様の情報について訂正、追加または削除をご希望される場合には、法令の規定によって特別の手続が定められている場合を除き、
                  お申し出いただいた方がご本人であることを確認したうえで、事実と異なる内容がある場合には、合理的な期間及び範囲で
                  情報の訂正、追加または削除をします。
                </p>
              </section>

              {/* 7. 利用停止・消去 */}
              <section>
                <h2 className="text-xl font-bold mb-4 text-[#1888CF]">
                  7. 利用停止・消去
                </h2>
                <p className="leading-relaxed mb-4">
                  当社の開示対象個人情報に関して、ご本人様の情報の利用停止または消去または第三者への提供の停止をご希望される場合には、
                  以下の事項のいずれか一つに該当する場合には、お申し出いただいた方がご本人であることを確認したうえで、
                  原則として合理的な期間及び範囲で利用停止または消去します。
                </p>
                <div className="space-y-3 ml-4">
                  <p>
                    (1)当社が、ご本人様の同意なく本方針の2に記載の利用目的の範囲を超えて個人情報を利用したとき
                  </p>
                  <p>
                    (2)当社が、当該個人情報を違法または不正な方法で取得したとき
                  </p>
                  <p>(3)当社が、不正に第三者に個人情報を開示したとき</p>
                </div>
                <p className="leading-relaxed mt-4">
                  なお、これらの情報の一部または全部を利用停止または消去した場合、
                  不本意ながらご要望に沿ったサービスの提供ができなくなることがありますので、
                  ご理解とご協力を賜りますようお願い申し上げます。また、労働基準法等、法令に基づき保有しております情報については、
                  利用停止または消去のお申し出には応じられない場合があります。
                </p>
              </section>

              {/* 8. 開示等の受付方法・窓口 */}
              <section>
                <h2 className="text-xl font-bold mb-4 text-[#1888CF]">
                  8. 開示等の受付方法・窓口
                </h2>
                <p className="leading-relaxed mb-4">
                  当社の開示対象個人情報に関して、上記4.5.6.7のお申し出及び、その他の個人情報に関するお問合せは以下の方法にて受け付けます。
                </p>
                <p className="leading-relaxed mb-4">
                  なお、この受付方法によらない開示等の求めには応じられない場合がありますので、ご了承ください。
                </p>
                <p className="leading-relaxed mb-6">
                  開示等とは、個人情報の利用目的の通知、開示、内容の訂正、追加または削除、利用の停止、消去及び第三者への提供の停止をいいます。
                </p>

                <h3 className="text-lg font-bold mb-3">(1)受付手続</h3>
                <p className="leading-relaxed mb-4">
                  下記の宛先に電話でお申込ください。受付手続についての詳細は、お申し出いただいた際にご案内申し上げますが、
                  下記の窓口及び方法により、ご本人様(または代理人)であることの確認をしたうえで、原則として書面により回答します。
                  また、お申し出内容によっては、当社所定の申込書面をご提出いただく場合があります。
                </p>

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h4 className="font-bold mb-2">
                    【受付の方法・窓口】お客様、及びその他の方の窓口
                  </h4>
                  <p className="mb-2">
                    住所：東京都豊島区東池袋1-25-8 タカセビル本館3F　個人情報受付センター
                  </p>
                  <p className="mb-2">電話番号：0120-000-000</p>
                  <p>
                    受付時間は、平日の午前9時から午後5時となります。
                    <br />
                    ※土日祝祭日及び8月11日～8月17日、12月28日～1月4日を除きます。
                  </p>
                </div>

                <p className="leading-relaxed mb-4">
                  ･ご本人様からのお申込の場合、ご本人であることの確認のために、以下の情報をご提出いただきます。
                </p>

                <div className="space-y-4 ml-4 mb-6">
                  <div>
                    <h4 className="font-bold mb-2">【電話口での確認方法】</h4>
                    <p>･氏名・住所・電話番号・生年月日等の当社ご登録情報の確認。</p>
                  </div>

                  <div>
                    <h4 className="font-bold mb-2">
                      【申込書面をご提出いただく際に同封いただくもの】
                    </h4>
                    <p>
                      ･運転免許証、パスポート、健康保険の被保険者証、外国人登録証の写しのいずれか1つ
                    </p>
                    <p>
                      ･現住所を確認できる書類(住民票の写し、公共料金の請求書等)
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold mb-2">
                      【代理人からのお申込の場合】
                    </h4>
                    <p>･代理人であることを示す委任状</p>
                    <p>･委任状に押印されたご本人様の印鑑の印鑑証明書</p>
                    <p>
                      ･代理人の本人確認書類(ご本人様からのお申込に準ずる)
                    </p>
                    <p>
                      なお、ご提出いただいた証明書類等につきましては返却いたしません。
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold mb-2">【手数料】</h4>
                    <p>
                      「利用目的の通知」あるいは「開示」につきましては、1件のお申込みにつき手数料として1,000円いただきます。
                      1,000円分の郵便小為替を上記書類にあわせてご同封ください。上記の通り手数料が同封されていなかった場合は、
                      その旨ご連絡申し上げますが、所定の期間内にお支払いいただけない場合は開示等の求めがなかったものといたします。
                    </p>
                    <p>なお、送付頂いた書類は原則としてご返却いたしません。</p>
                  </div>
                </div>

                <h4 className="font-bold mb-3">※注意事項</h4>
                <div className="space-y-2 ml-4 text-sm">
                  <p>
                    ・郵送や配送途中の書類の紛失、事故による未着につきましては、当社では責任を負いかねます。
                  </p>
                  <p>
                    ・必要事項を全てご記入下さい。書類に不備がある場合は、返送させていただく場合がございます。
                  </p>
                  <p>
                    ・個人情報保護法の例外規定にあたる場合など、開示等の求めにお答えできない場合がございます。
                  </p>
                  <p>・内容により、お時間をいただく場合がございます。</p>
                  <p>
                    ・開示等の求めにともない収集した個人情報は、開示等の求めの必要な範囲のみで取扱うものとします。
                  </p>
                  <p>
                    提出していただいた書面は当社で適切に廃棄いたします。
                  </p>
                  <p>
                    ・「訂正等」、「利用停止等」の結果、該当するサービスがご利用いただけなくなることがあります。あらかじめご了承下さい。
                  </p>
                </div>
              </section>

              {/* 9. 附則 */}
              <section>
                <h2 className="text-xl font-bold mb-4 text-[#1888CF]">
                  9. 附則
                </h2>
                <p className="leading-relaxed">
                  この個人情報保護方針は、2012年5月1日から施行します。なお、法令・各種ガイドライン等の制定や変更等に伴い、
                  この個人情報保護方針を変更することがあります。方針の変更につきましては当社ホームページ上において公表します。
                </p>
              </section>
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

      {/* フッター */}
      <footer className="w-full bg-[#FDFDFD] py-4 px-4 border-t border-gray-200">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 text-sm text-gray-600">
          <Link href="/company" className="hover:text-[#1888CF]">
            運営者情報
          </Link>
          <Link href="/privacy" className="hover:text-[#1888CF]">
            プライバシーポリシー
          </Link>
          <a
            href="https://jp01-troublesoudan.site-test02.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#1888CF]"
          >
            お問い合わせ
          </a>
        </div>
        <p className="text-center text-xs text-gray-500 mt-3">
          © 2025 トラブルまるごとレスキュー隊
        </p>
      </footer>
    </div>
  );
}

