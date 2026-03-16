"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LogOutIcon,
  UserIcon,
  SettingsIcon,
  MoonIcon,
  SunIcon,
  SearchIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { NotificationsPopover } from "@/components/notifications/notifications-popover";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

export function TopBar() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(3);
  const [mounted, setMounted] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) setUserEmail(user.email);
    };
    loadUser();
  }, []);

  const getInitials = (email: string) => {
    if (!email) return "U";
    const parts = email.split("@")[0];
    return parts.slice(0, 2).toUpperCase();
  };

  const getDisplayName = (email: string) => {
    if (!email) return "User";
    return email.split("@")[0];
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Logout failed, try again later");
      return;
    }
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const handleMarkAllAsRead = () => {
    setUnreadCount(0);
  };

  return (
    <header className="fixed top-0 w-full z-50 border-b border-border/50 bg-card/80 backdrop-blur-md h-14 px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">B</span>
          </div>
          <span className="font-bold text-lg tracking-tight text-foreground hidden sm:inline-block">
            Billa
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-1.5">
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <SunIcon className="h-[18px] w-[18px]" />
            ) : (
              <MoonIcon className="h-[18px] w-[18px]" />
            )}
          </Button>
        )}

        <NotificationsPopover
          unreadCount={unreadCount}
          onMarkAllAsRead={handleMarkAllAsRead}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="rounded-lg h-9 px-2 gap-2 hover:bg-accent"
              aria-label="User menu"
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {getInitials(userEmail)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:inline-block max-w-[120px] truncate">
                {getDisplayName(userEmail)}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {getDisplayName(userEmail)}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {userEmail}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer w-full">
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer w-full">
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOutIcon className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
