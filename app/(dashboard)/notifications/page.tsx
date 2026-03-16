"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BellIcon,
  CalendarIcon,
  ClockIcon,
  CheckIcon,
  AlertCircleIcon,
  InfoIcon,
  BellOffIcon,
  TrophyIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sampleNotifications = [
  {
    id: 1,
    message: "Your rent payment is due tomorrow",
    date: "2024-06-30",
    time: "09:00",
    type: "reminder",
    read: false,
    priority: "high",
  },
  {
    id: 2,
    message: "You have exceeded your dining budget for this month",
    date: "2024-06-28",
    time: "14:30",
    type: "alert",
    read: false,
    priority: "medium",
  },
  {
    id: 3,
    message: "Congratulations! You reached 50% of your Emergency Fund goal",
    date: "2024-06-25",
    time: "10:15",
    type: "achievement",
    read: true,
    priority: "low",
  },
  {
    id: 4,
    message: "New feature: You can now set up recurring transactions",
    date: "2024-06-20",
    time: "08:00",
    type: "info",
    read: true,
    priority: "low",
  },
];

const iconMap: Record<string, React.ReactNode> = {
  reminder: <CalendarIcon className="h-4 w-4 text-blue-500" />,
  alert: <AlertCircleIcon className="h-4 w-4 text-rose-500" />,
  achievement: <TrophyIcon className="h-4 w-4 text-emerald-500" />,
  info: <InfoIcon className="h-4 w-4 text-violet-500" />,
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(sampleNotifications);
  const [filter, setFilter] = useState("all");

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    return n.type === filter;
  });

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const formatDateTime = (date: string, time: string) => {
    return new Date(`${date}T${time}`).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filters = [
    { value: "all", label: "All" },
    { value: "unread", label: "Unread", count: unreadCount },
    { value: "reminder", label: "Reminders" },
    { value: "alert", label: "Alerts" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            Stay updated with reminders and alerts
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" size="sm" className="h-9" onClick={markAllAsRead}>
            <CheckIcon className="h-3.5 w-3.5 mr-2" />
            Mark all read
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {filters.map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? "default" : "outline"}
            size="sm"
            className="h-8 text-xs"
            onClick={() => setFilter(f.value)}
          >
            {f.label}
            {"count" in f && f.count! > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 h-4">
                {f.count}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader className="py-4 px-5">
          <CardTitle className="text-base font-semibold">
            {filter === "all" ? "All Notifications" : `${filters.find((f) => f.value === filter)?.label}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
                <BellOffIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium mb-0.5">No notifications</p>
              <p className="text-xs text-muted-foreground">
                {filter !== "all" ? "Try a different filter" : "You're all caught up!"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredNotifications.map((notification, idx) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex items-start gap-3 p-3.5 rounded-xl border transition-all duration-200 animate-slide-up",
                    !notification.read
                      ? "bg-primary/5 border-primary/20"
                      : "hover:bg-accent/50"
                  )}
                  style={{ animationDelay: `${idx * 50}ms`, animationFillMode: "both" }}
                >
                  <div className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                    !notification.read ? "bg-primary/10" : "bg-muted"
                  )}>
                    {iconMap[notification.type] || <BellIcon className="h-4 w-4 text-muted-foreground" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm",
                      !notification.read ? "font-semibold" : "font-medium"
                    )}>
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <ClockIcon className="h-2.5 w-2.5" />
                        {formatDateTime(notification.date, notification.time)}
                      </span>
                      {!notification.read && (
                        <Badge variant="outline" className="text-[10px] px-1.5 h-4 font-normal text-primary border-primary/30">
                          New
                        </Badge>
                      )}
                    </div>
                  </div>

                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg flex-shrink-0"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <CheckIcon className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        Notifications are currently using sample data. Real-time notifications will be available in a future update.
      </p>
    </div>
  );
}
