"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  MenuIcon,
  SunIcon,
  MoonIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { signOut } from "../(auth)/actions";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  // After mounting, we can safely show the UI that depends on the theme
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const navItems = [
    { href: "/dashboard", icon: BarChartIcon, label: "Overview" },
    { href: "/expenses", icon: ArrowDownIcon, label: "Expenses" },
    { href: "/income", icon: ArrowUpIcon, label: "Income" },
    { href: "/budgeting", icon: PiggyBankIcon, label: "Budgeting" },
    { href: "/reports", icon: LineChartIcon, label: "Reports" },
    { href: "/settings", icon: SettingsIcon, label: "Settings" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="md:hidden"
            >
              <MenuIcon className="h-5 w-5" />
            </Button>
            <Link href="/dashboard">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-green-500 hidden sm:block">
                  Billa
                </h1>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </Button>
            )}
            <Button variant="ghost" size="icon">
              <UserIcon className="h-5 w-5" />
            </Button>
            <form>
              <Button variant="ghost" size="icon" formAction={signOut}>
                <LogOutIcon className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside
          className={cn(
            "border-r bg-card transition-all duration-300 ease-in-out",
            isSidebarCollapsed ? "w-16" : "w-16 md:w-64"
          )}
        >
          <div className="sticky top-0">
            <div className="hidden md:flex items-center justify-end p-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="hidden md:flex"
              >
                <MenuIcon className="h-5 w-5" />
              </Button>
            </div>
            <nav className="p-2 md:p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link href={item.href} key={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start",
                        isActive &&
                          "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5",
                          !isSidebarCollapsed && "md:mr-2"
                        )}
                      />
                      {!isSidebarCollapsed && (
                        <span className="hidden md:inline">{item.label}</span>
                      )}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="flex-1 bg-background p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
