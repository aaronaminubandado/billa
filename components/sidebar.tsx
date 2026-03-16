"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboardIcon,
  ArrowLeftRightIcon,
  WalletIcon,
  PiggyBankIcon,
  SettingsIcon,
  TagIcon,
  TargetIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const navItems = [
  { href: "/dashboard", icon: LayoutDashboardIcon, label: "Dashboard" },
  { href: "/transactions", icon: ArrowLeftRightIcon, label: "Transactions" },
  { href: "/wallets", icon: WalletIcon, label: "Wallets" },
  { href: "/categories", icon: TagIcon, label: "Categories" },
  { href: "/goals", icon: TargetIcon, label: "Goals" },
  { href: "/budgeting", icon: PiggyBankIcon, label: "Budgeting" },
];

const bottomNavItems = [
  { href: "/settings", icon: SettingsIcon, label: "Settings" },
];

export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const mobileNavItems = [
    navItems[0],
    navItems[1],
    navItems[2],
    navItems[4],
    bottomNavItems[0],
  ];

  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border/50 flex justify-around items-center h-16 px-1 safe-area-bottom">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              href={item.href}
              key={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full rounded-lg mx-0.5 transition-all duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-7 rounded-full transition-all duration-200",
                  isActive && "bg-primary/10"
                )}
              >
                <Icon className={cn("h-[18px] w-[18px]", isActive && "stroke-[2.5]")} />
              </div>
              <span className={cn("text-[10px] mt-0.5 font-medium", isActive && "font-semibold")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] border-r border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 ease-in-out flex flex-col min-h-0",
          collapsed ? "w-[68px]" : "w-60"
        )}
      >
        {/* Compact header: Menu label + toggle on one row */}
        <div
          className={cn(
            "flex items-center shrink-0 border-b border-border/50 px-2 py-1.5 gap-1",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          {!collapsed && (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 px-1">
              Menu
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronsRightIcon className="h-3.5 w-3.5" />
            ) : (
              <ChevronsLeftIcon className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto min-h-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            const linkContent = (
              <Link href={item.href} key={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    collapsed && "justify-center px-2"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon
                    className={cn(
                      "h-[18px] w-[18px] flex-shrink-0",
                      isActive && "stroke-[2.5]"
                    )}
                  />
                  {!collapsed && <span>{item.label}</span>}
                </div>
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <React.Fragment key={item.href}>{linkContent}</React.Fragment>;
          })}
        </nav>

        {/* Settings at bottom with clear separation */}
        <div className="shrink-0 border-t border-border/50 bg-muted/20 pt-3 pb-2 px-2 mt-auto">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            const linkContent = (
              <Link href={item.href} key={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <Icon className="h-[18px] w-[18px] flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </div>
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <React.Fragment key={item.href}>{linkContent}</React.Fragment>;
          })}
        </div>
      </aside>
    </TooltipProvider>
  );
}
