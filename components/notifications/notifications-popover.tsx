// Notifications popover component for the top bar
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  BellIcon,
  CheckIcon,
  CalendarIcon,
  AlertCircleIcon,
  InfoIcon,
  BellOffIcon,
  ExternalLinkIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Sample notifications data
const sampleNotifications = [
  {
    id: 1,
    message: "Your rent payment is due tomorrow",
    date: "2023-06-30",
    time: "09:00",
    type: "reminder",
    read: false,
  },
  {
    id: 2,
    message: "You have exceeded your dining budget for this month",
    date: "2023-06-28",
    time: "14:30",
    type: "alert",
    read: false,
  },
  {
    id: 3,
    message: "Congratulations! You reached 50% of your Emergency Fund goal",
    date: "2023-06-25",
    time: "10:15",
    type: "achievement",
    read: true,
  },
  {
    id: 4,
    message: "New feature: You can now set up recurring transactions",
    date: "2023-06-20",
    time: "08:00",
    type: "info",
    read: true,
  },
];

interface NotificationsPopoverProps {
  unreadCount: number;
  onMarkAllAsRead: () => void;
}

export function NotificationsPopover({
  unreadCount,
  onMarkAllAsRead,
}: NotificationsPopoverProps) {
  const [notifications, setNotifications] = useState(sampleNotifications);
  const [open, setOpen] = useState(false);

  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "reminder":
        return <CalendarIcon className="h-4 w-4 text-blue-500" />;
      case "alert":
        return <AlertCircleIcon className="h-4 w-4 text-red-500" />;
      case "achievement":
        return <CheckIcon className="h-4 w-4 text-green-500" />;
      case "info":
        return <InfoIcon className="h-4 w-4 text-purple-500" />;
      default:
        return <BellIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  // Format date and time
  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`);
    return dateObj.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Mark notification as read
  const markAsRead = (id: number) => {
    // TODO: Implement actual update with Supabase
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <BellIcon className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-medium">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAllAsRead}
              className="h-8 text-xs"
            >
              Mark all as read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BellOffIcon className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 hover:bg-muted/50 transition-colors",
                    !notification.read && "bg-muted/30"
                  )}
                >
                  <div className="flex gap-3">
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p
                        className={cn(
                          "text-sm",
                          !notification.read && "font-medium"
                        )}
                      >
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(notification.date, notification.time)}
                      </p>
                    </div>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <CheckIcon className="h-3 w-3" />
                        <span className="sr-only">Mark as read</span>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-2 border-t">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            asChild
          >
            <Link href="/notifications" onClick={() => setOpen(false)}>
              <span>View all notifications</span>
              <ExternalLinkIcon className="ml-2 h-3 w-3" />
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
