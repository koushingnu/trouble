"use client";

import { Fragment } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function ClientNavigation() {
  const pathname = usePathname();

  // 認証関連のページかどうかを判定
  const isAuthPage = ["/auth", "/register", "/register/complete"].includes(
    pathname
  );

  const navigation = [
    {
      name: "新規相談",
      href: "/consultation/new",
      current: pathname === "/consultation/new",
    },
    { name: "相談履歴", href: "/history", current: pathname === "/history" },
    {
      name: "お問い合わせ",
      href: "/contact",
      current: pathname === "/contact",
    },
  ];

  return (
    <Disclosure as="nav" className="bg-white shadow-sm border-b border-sky-100">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <div className="flex flex-shrink-0 items-center">
                  <Link
                    href={"/consultation/new"}
                    className="text-xl font-bold text-sky-800 hover:text-sky-600 transition-colors"
                  >
                    トラブル相談
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={classNames(
                        item.current
                          ? "border-sky-500 text-sky-800"
                          : "border-transparent text-gray-500 hover:border-sky-300 hover:text-sky-700",
                        "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors"
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
                <Link
                  href="/admin"
                  className={classNames(
                    pathname === "/admin"
                      ? "bg-sky-100 text-sky-800"
                      : "text-gray-500 hover:text-sky-700",
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  )}
                >
                  管理
                </Link>
                <div className="space-x-4">
                  <Link
                    href="/auth"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 transition-colors"
                  >
                    ログイン
                  </Link>
                </div>
              </div>
              <div className="-mr-2 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-sky-50 hover:text-sky-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500">
                  <span className="sr-only">メニューを開く</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={Link}
                  href={item.href}
                  className={classNames(
                    item.current
                      ? "bg-sky-50 border-sky-500 text-sky-700"
                      : "border-transparent text-gray-500 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700",
                    "block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors"
                  )}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
              <Disclosure.Button
                as={Link}
                href="/admin"
                className={classNames(
                  pathname === "/admin"
                    ? "bg-sky-50 border-sky-500 text-sky-700"
                    : "border-transparent text-gray-500 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700",
                  "block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors"
                )}
              >
                管理
              </Disclosure.Button>
            </div>
            <div className="border-t border-gray-200 pb-3 pt-4">
              <div className="space-y-1">
                <Disclosure.Button
                  as={Link}
                  href="/auth"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-sky-50 hover:text-sky-700 transition-colors"
                >
                  ログイン
                </Disclosure.Button>
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
