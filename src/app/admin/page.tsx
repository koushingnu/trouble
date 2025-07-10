"use client";

import { useState } from "react";
import UserList from "./components/UserList";
import TokenManagement from "./components/TokenManagement";

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
  const [value, setValue] = useState(0);

  const handleChange = (newValue: number) => {
    setValue(newValue);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">管理画面</h1>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex" aria-label="管理画面タブ">
            <button
              onClick={() => handleChange(0)}
              className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                value === 0
                  ? "border-sky-500 text-sky-600"
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
              className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                value === 1
                  ? "border-sky-500 text-sky-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              role="tab"
              aria-selected={value === 1}
              aria-controls={`admin-tabpanel-1`}
            >
              認証キー管理
            </button>
          </nav>
        </div>

        <TabPanel value={value} index={0}>
          <UserList />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <TokenManagement />
        </TabPanel>
      </div>
    </div>
  );
}
 