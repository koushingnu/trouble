"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import UserList from "./components/UserList";
import TokenManagement from "./components/TokenManagement";
import CsvImport from "./components/CsvImport";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [value, setValue] = useState(0);

  const handleChange = (newValue: number) => {
    setValue(newValue);
  };

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gradient-to-b from-[#ACE0F9] to-[#64B3F4] pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* ヘッダー */}
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">管理画面</h1>
            <button
              onClick={() => router.push("/mypage")}
              className="text-white text-sm hover:underline"
            >
              ← 戻る
            </button>
          </div>

          {/* タブ付きコンテンツ */}
          <div className="bg-[#FDFDFD] shadow-lg rounded-3xl overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex" aria-label="管理画面タブ">
                <button
                  onClick={() => handleChange(0)}
                  className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-base ${
                    value === 0
                      ? "border-[#1888CF] text-[#1888CF]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  role="tab"
                  aria-selected={value === 0}
                  aria-controls={`admin-tabpanel-0`}
                >
                  ユーザー管理
                </button>
                <button
                  onClick={() => handleChange(1)}
                  className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-base ${
                    value === 1
                      ? "border-[#1888CF] text-[#1888CF]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  role="tab"
                  aria-selected={value === 1}
                  aria-controls={`admin-tabpanel-1`}
                >
                  認証キー管理
                </button>
                <button
                  onClick={() => handleChange(2)}
                  className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-base ${
                    value === 2
                      ? "border-[#1888CF] text-[#1888CF]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  role="tab"
                  aria-selected={value === 2}
                  aria-controls={`admin-tabpanel-2`}
                >
                  CSVインポート
                </button>
              </nav>
            </div>

            <TabPanel value={value} index={0}>
              <UserList />
            </TabPanel>
            <TabPanel value={value} index={1}>
              <TokenManagement />
            </TabPanel>
            <TabPanel value={value} index={2}>
              <CsvImport />
            </TabPanel>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
