// Enhanced top bar with responsive design and mobile-friendly menu
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  UserIcon,
  LogOutIcon,
  SunIcon,
  MoonIcon,
  MoreVerticalIcon,
  BellIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useMediaQuery } from "@/hooks/use-media-query";

export function TopBar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // Added media query hook to detect mobile viewports
  const isMobile = useMediaQuery("(max-width: 768px)");

  // After mounting, we can safely show the UI that depends on the theme
  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="border-b bg-card sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <div className="flex items-center gap-2">
              {/* <img src="/Billa.png" alt="Billa Logo" className="h-8 w-auto" /> */}
              <h1 className="text-xl font-bold text-green-500 hidden sm:block">
                Billa
              </h1>
            </div>
          </Link>
        </div>

        {/* Desktop view - show all icons */}
        {!isMobile && (
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

            <Button variant="ghost" size="icon" aria-label="Notifications">
              <BellIcon className="h-5 w-5" />
              <Badge
                className="absolute top-0 right-0 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                variant="destructive"
              >
                3
              </Badge>
              <span className="sr-only">3 unread notifications</span>
            </Button>

            <Link href="/profile">
              <Avatar>
                <AvatarImage
                  src="/placeholder.svg?height=32&width=32"
                  alt="User"
                />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </Link>
          </div>
        )}

        {/* Mobile view - collapse into dropdown menu */}
        {isMobile && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Menu">
                <MoreVerticalIcon className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BellIcon className="mr-2 h-4 w-4" />
                <span>Notifications</span>
                <Badge className="ml-auto" variant="destructive">
                  3
                </Badge>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <SunIcon className="mr-2 h-4 w-4" />
                ) : (
                  <MoonIcon className="mr-2 h-4 w-4" />
                )}
                <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOutIcon className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
