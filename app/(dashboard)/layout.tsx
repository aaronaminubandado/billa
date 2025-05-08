// Updated layout to support responsive sidebar and top bar
"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Auto-collapse sidebar on smaller screens
  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  }, [isMobile]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopBar />

      <div className="flex flex-1">
        <Sidebar
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />

        <main
          className={cn(
            "flex-1 bg-background p-4 md:p-8",
            // Add bottom padding on mobile to account for bottom navigation
            isMobile ? "pb-20" : ""
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
