"use client";

import { ReactNode } from "react";

export interface Column<T> {
  key: keyof T;
  label: string;
  width: number;
  align?: "left" | "center" | "right";
  format?: (value: T[keyof T], row: T) => ReactNode;
}

interface AdminTableProps<T> {
  title: string;
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  onRefresh?: () => void;
  emptyMessage?: string;
  actionButton?: ReactNode;
}

export default function AdminTable<T>({
  title,
  columns,
  data,
  isLoading = false,
  onRefresh,
  emptyMessage = "データがありません",
  actionButton,
}: AdminTableProps<T>) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <div className="flex items-center space-x-4">
            {actionButton}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-sky-700 bg-sky-100 hover:bg-sky-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg
                  className={`-ml-0.5 mr-1 h-4 w-4 ${
                    isLoading ? "animate-spin" : ""
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                更新
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key.toString()}
                  scope="col"
                  className={`px-6 py-3 text-xs font-medium tracking-wider text-gray-500 uppercase ${
                    column.align ? `text-${column.align}` : "text-left"
                  }`}
                  style={{ width: column.width }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-4 text-sm text-gray-500 text-center"
                >
                  読み込み中...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-4 text-sm text-gray-500 text-center"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={index}>
                  {columns.map((column) => (
                    <td
                      key={column.key.toString()}
                      className={`px-6 py-4 text-sm text-gray-900 ${
                        column.align ? `text-${column.align}` : ""
                      }`}
                    >
                      {column.format
                        ? column.format(item[column.key], item)
                        : String(item[column.key])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}