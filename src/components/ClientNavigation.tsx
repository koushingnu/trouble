"use client";

import { Fragment } from "react";
import { Disclosure } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

interface NavigationItem {
  name: string;
  href: string;
}

export default function ClientNavigation() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navigation: NavigationItem[] = session
    ? [
        { name: "相談する", href: "/consultation/new" },
        { name: "相談履歴", href: "/history" },
        { name: "お問い合わせ", href: "/contact" },
      ]
    : [];

  return (
    <Disclosure as="nav" className="bg-white shadow-sm">
      {({ open }) => (
        <>
          <div className="border-b border-sky-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex h-20 items-center justify-between">
                <div className="flex items-center">
                  <Link
                    href={session ? "/consultation/new" : "/auth"}
                    className="text-2xl font-bold text-sky-800 hover:text-sky-600 transition-colors"
                  >
                    トラブル相談
                  </Link>
                  <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          pathname === item.href
                            ? "border-sky-500 text-sky-800"
                            : "border-transparent text-gray-500 hover:border-sky-300 hover:text-sky-700",
                          "inline-flex items-center border-b-2 px-2 pt-1 text-base font-medium transition-colors"
                        )}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
                  {session && (
                    <>
                      <button
                        onClick={() => signOut({ callbackUrl: "/auth" })}
                        className="inline-flex items-center px-6 py-2.5 border border-transparent text-base font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 transition-colors"
                      >
                        ログアウト
                      </button>
                      {session.user.isAdmin && (
                        <Link
                          href="/admin"
                          className="text-sky-600 hover:text-sky-700 text-base font-medium ml-2"
                        >
                          管理
                        </Link>
                      )}
                    </>
                  )}
                </div>
                <div className="flex items-center sm:hidden">
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2.5 text-gray-400 hover:bg-sky-50 hover:text-sky-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500">
                    <span className="sr-only">メニューを開く</span>
                    {open ? (
                      <XMarkIcon className="block h-7 w-7" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-7 w-7" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
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
                    pathname === item.href
                      ? "bg-sky-50 border-sky-500 text-sky-700"
                      : "border-transparent text-gray-500 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700",
                    "block pl-3 pr-4 py-3 border-l-4 text-lg font-medium transition-colors"
                  )}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
            {session && (
              <div className="border-t border-gray-200 pb-3 pt-4">
                <div className="space-y-1">
                  <Disclosure.Button
                    as="button"
                    onClick={() => signOut({ callbackUrl: "/auth" })}
                    className="block w-full text-left px-4 py-3 text-lg font-medium text-gray-500 hover:bg-sky-50 hover:text-sky-700 transition-colors"
                  >
                    ログアウト
                  </Disclosure.Button>
                  {session.user.isAdmin && (
                    <Disclosure.Button
                      as={Link}
                      href="/admin"
                      className="block w-full text-left px-4 py-3 text-lg font-medium text-sky-600 hover:text-sky-700 transition-colors"
                    >
                      管理
                    </Disclosure.Button>
                  )}
                </div>
              </div>
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
