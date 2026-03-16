"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { ThemeProvider } from "@/components/theme-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex min-h-screen flex-col">
        <TopBar />
        <div className="flex flex-1 pt-14">
          <Sidebar
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
          />
          <main
            className={cn(
              "flex-1 min-w-0 p-4 sm:p-5 md:p-6 lg:p-8 pb-20 md:pb-8 overflow-x-hidden transition-[margin] duration-300",
              sidebarCollapsed ? "md:ml-[68px]" : "md:ml-60"
            )}
          >
            <div className="max-w-7xl mx-auto animate-in">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
