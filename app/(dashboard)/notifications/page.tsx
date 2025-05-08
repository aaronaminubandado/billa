// Notifications management page
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BellIcon,
  CalendarIcon,
  ClockIcon,
  CheckIcon,
  XIcon,
  AlertCircleIcon,
  InfoIcon,
  BellOffIcon,
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
    relatedItem: "Rent Payment",
    read: false,
    priority: "high",
  },
  {
    id: 2,
    message: "You have exceeded your dining budget for this month",
    date: "2023-06-28",
    time: "14:30",
    type: "alert",
    relatedItem: "Dining Budget",
    read: false,
    priority: "medium",
  },
  {
    id: 3,
    message: "Congratulations! You reached 50% of your Emergency Fund goal",
    date: "2023-06-25",
    time: "10:15",
    type: "achievement",
    relatedItem: "Emergency Fund Goal",
    read: true,
    priority: "low",
  },
  {
    id: 4,
    message: "New feature: You can now set up recurring transactions",
    date: "2023-06-20",
    time: "08:00",
    type: "info",
    relatedItem: null,
    read: true,
    priority: "low",
  },
  {
    id: 5,
    message: "Credit card payment due in 3 days",
    date: "2023-06-15",
    time: "12:00",
    type: "reminder",
    relatedItem: "Credit Card Payment",
    read: true,
    priority: "high",
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(sampleNotifications);
  const [filter, setFilter] = useState("all");

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.read;
    return notification.type === filter;
  });

  // Mark notification as read
  const markAsRead = (id: number) => {
    // TODO: Implement actual update with Supabase
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // Mark all as read
  const markAllAsRead = () => {
    // TODO: Implement actual update with Supabase
    setNotifications(
      notifications.map((notification) => ({ ...notification, read: true }))
    );
  };

  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "reminder":
        return <CalendarIcon className="h-5 w-5 text-blue-500" />;
      case "alert":
        return <AlertCircleIcon className="h-5 w-5 text-red-500" />;
      case "achievement":
        return <CheckIcon className="h-5 w-5 text-green-500" />;
      case "info":
        return <InfoIcon className="h-5 w-5 text-purple-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  // Get badge variant based on priority
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "destructive";//change to warning
      case "low":
        return "secondary";
      default:
        return "outline";
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

  // Count unread notifications
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground">
          Stay updated with reminders and alerts
        </p>
      </div>

      {/* Filter and action controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unread")}
          >
            Unread
            {unreadCount > 0 && (
              <Badge className="ml-2" variant="secondary">
                {unreadCount}
              </Badge>
            )}
          </Button>
          <Button
            variant={filter === "reminder" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("reminder")}
          >
            Reminders
          </Button>
          <Button
            variant={filter === "alert" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("alert")}
          >
            Alerts
          </Button>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {/* Notifications list */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Your Notifications</CardTitle>
          <CardDescription>
            Reminders, alerts, and updates about your finances
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BellOffIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No notifications found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {filter !== "all"
                  ? "Try changing your filter to see more notifications"
                  : "You're all caught up!"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex items-start p-4 rounded-lg border",
                    !notification.read && "bg-muted/50"
                  )}
                >
                  <div className="mr-4 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <p
                        className={cn(
                          "font-medium",
                          !notification.read && "font-semibold"
                        )}
                      >
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <Badge
                            variant="outline"
                            className="whitespace-nowrap"
                          >
                            New
                          </Badge>
                        )}
                        <Badge
                          variant={getPriorityBadge(notification.priority)}
                          className="whitespace-nowrap"
                        >
                          {notification.priority.charAt(0).toUpperCase() +
                            notification.priority.slice(1)}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <ClockIcon className="mr-1 h-3 w-3" />
                        {formatDateTime(notification.date, notification.time)}
                      </div>
                      {notification.relatedItem && (
                        <div>Related to: {notification.relatedItem}</div>
                      )}
                    </div>
                  </div>

                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-2 shrink-0"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <CheckIcon className="h-4 w-4" />
                      <span className="sr-only">Mark as read</span>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
