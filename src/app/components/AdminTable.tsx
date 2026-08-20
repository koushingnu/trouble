"use client";

import { ReactNode, useMemo, useState } from "react";

export interface Column<T> {
  key: keyof T;
  label: string;
  width: number;
  align?: "left" | "center" | "right";
  format?: (value: T[keyof T], row: T) => ReactNode;
  sortable?: boolean;
  // 結合・整形された値（名前、ステータス、卸先名など）を持つ列のソート用アクセサ
  sortValue?: (row: T) => string | number | null;
}

type SortDirection = "asc" | "desc";

interface SortState {
  columnIndex: number;
  direction: SortDirection;
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
  const [sort, setSort] = useState<SortState | null>(null);

  const getSortValue = (column: Column<T>, row: T): string | number | null => {
    if (column.sortValue) return column.sortValue(row);
    const value = row[column.key];
    if (value === null || value === undefined) return null;
    if (typeof value === "string" || typeof value === "number") return value;
    return String(value);
  };

  const sortedData = useMemo(() => {
    if (!sort) return data;
    const column = columns[sort.columnIndex];
    if (!column) return data;

    const withValues = data.map((row) => ({
      row,
      value: getSortValue(column, row),
    }));

    withValues.sort((a, b) => {
      if (a.value === null && b.value === null) return 0;
      if (a.value === null) return 1;
      if (b.value === null) return -1;
      if (typeof a.value === "number" && typeof b.value === "number") {
        return a.value - b.value;
      }
      return String(a.value).localeCompare(String(b.value), "ja");
    });

    const sorted = withValues.map((w) => w.row);
    return sort.direction === "asc" ? sorted : sorted.reverse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, sort, columns]);

  const handleHeaderClick = (columnIndex: number, column: Column<T>) => {
    if (!column.sortable) return;
    setSort((prev) => {
      if (!prev || prev.columnIndex !== columnIndex) {
        return { columnIndex, direction: "asc" };
      }
      if (prev.direction === "asc") {
        return { columnIndex, direction: "desc" };
      }
      return null;
    });
  };

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
              {columns.map((column, columnIndex) => {
                const isActive = sort?.columnIndex === columnIndex;
                return (
                  <th
                    key={columnIndex}
                    scope="col"
                    onClick={() => handleHeaderClick(columnIndex, column)}
                    className={`px-6 py-3 text-xs font-medium tracking-wider text-gray-500 uppercase whitespace-nowrap ${
                      column.align ? `text-${column.align}` : "text-left"
                    } ${column.sortable ? "cursor-pointer select-none hover:text-gray-700" : ""}`}
                    style={{ width: column.width }}
                  >
                    <span className="inline-flex items-center gap-1">
                      {column.label}
                      {column.sortable && (
                        <span className="text-gray-400">
                          {isActive
                            ? sort?.direction === "asc"
                              ? "▲"
                              : "▼"
                            : "↕"}
                        </span>
                      )}
                    </span>
                  </th>
                );
              })}
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
            ) : sortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-4 text-sm text-gray-500 text-center"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((item, index) => (
                <tr key={index}>
                  {columns.map((column, columnIndex) => (
                    <td
                      key={columnIndex}
                      className={`px-6 py-4 text-sm text-gray-900 whitespace-nowrap ${
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