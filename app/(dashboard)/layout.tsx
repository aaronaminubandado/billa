import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  BarChartIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  PiggyBankIcon,
  LineChartIcon,
  SettingsIcon,
  UserIcon,
  LogOutIcon,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-green-500 hidden sm:block">
                  Billa
                </h1>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <UserIcon className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <LogOutIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="w-16 md:w-64 border-r bg-white">
          <nav className="p-2 md:p-4 space-y-2">
            <Link href="/dashboard">
              <Button variant="ghost" className="w-full justify-start">
                <BarChartIcon className="h-5 w-5 md:mr-2" />
                <span className="hidden md:inline">Overview</span>
              </Button>
            </Link>
            <Link href="/expenses">
              <Button variant="ghost" className="w-full justify-start">
                <ArrowDownIcon className="h-5 w-5 md:mr-2" />
                <span className="hidden md:inline">Expenses</span>
              </Button>
            </Link>
            <Link href="/income">
              <Button variant="ghost" className="w-full justify-start">
                <ArrowUpIcon className="h-5 w-5 md:mr-2" />
                <span className="hidden md:inline">Income</span>
              </Button>
            </Link>
            <Link href="/budgeting">
              <Button variant="ghost" className="w-full justify-start">
                <PiggyBankIcon className="h-5 w-5 md:mr-2" />
                <span className="hidden md:inline">Budgeting</span>
              </Button>
            </Link>
            <Link href="/reports">
              <Button variant="ghost" className="w-full justify-start">
                <LineChartIcon className="h-5 w-5 md:mr-2" />
                <span className="hidden md:inline">Reports</span>
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" className="w-full justify-start">
                <SettingsIcon className="h-5 w-5 md:mr-2" />
                <span className="hidden md:inline">Settings</span>
              </Button>
            </Link>
          </nav>
        </aside>

        <main className="flex-1 bg-gray-50 p-8">{children}</main>
      </div>
    </div>
  );
}
