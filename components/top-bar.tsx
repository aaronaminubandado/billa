// Enhanced top bar with avatar dropdown and notification bell
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BellIcon,
  LogOutIcon,
  UserIcon,
  SettingsIcon,
  MoonIcon,
  SunIcon,
  MenuIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import { NotificationsPopover } from "@/components/notifications/notifications-popover";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

// Sample user data
const user = {
  name: "John Doe",
  email: "john@example.com",
  avatarUrl: "/placeholder.svg?height=40&width=40",
  initials: "JD",
};

interface TopBarProps {
  toggleSidebar: () => void;
}

export function TopBar({ toggleSidebar }: TopBarProps) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(3);
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();

  // Ensure theme component is only rendered after mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error("Logout failed, try again later");
      return false;
    }

    toast.success("Logout successful");
    return true;
  };

  const handleLogout = async () => {
    const success = await signOut();
    if (success) {
      router.push("/login");
    }
  };
  
  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    // TODO: Implement actual mark all as read with Supabase
    setUnreadCount(0);
  };

  return (
    <div className="fixed top-0 w-full z-50 border-b bg-card h-16 px-4 flex items-center justify-between">
      <div className="flex items-center">
        <Link href="/dashboard" className="flex items-center">
          {/* <img src="/Billa.png" alt="Billa Logo" className="h-8 w-auto mr-2" /> */}
          <span className="font-bold text-xl text-green-500 hidden sm:inline-block">
            Billa
          </span>
        </Link>
      </div>

      <div className="flex items-center space-x-2">
        {/* Theme toggle button */}
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

        {/* Notifications bell with popover */}
        <NotificationsPopover
          unreadCount={unreadCount}
          onMarkAllAsRead={handleMarkAllAsRead}
        />

        {/* User avatar with dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-8 w-8 ml-1"
              aria-label="User menu"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={user.avatarUrl || "/placeholder.svg"}
                  alt={user.name}
                />
                <AvatarFallback>{user.initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
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
              className="cursor-pointer text-red-600 dark:text-red-400"
            >
              <LogOutIcon className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
