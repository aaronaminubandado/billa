"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  UserIcon,
  BellIcon,
  GlobeIcon,
  ShieldIcon,
  PaletteIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
        setDisplayName(user.email?.split("@")[0] || "");
      }
    };
    loadUser();
  }, []);

  const getInitials = (email: string) => {
    if (!email) return "U";
    return email.split("@")[0].slice(0, 2).toUpperCase();
  };

  const handlePasswordChange = async () => {
    if (!newPassword || newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSavingPassword(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    setIsSavingPassword(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Password updated successfully");
    setNewPassword("");
    setConfirmPassword("");
  };

  const tabItems = [
    { value: "profile", icon: UserIcon, label: "Profile" },
    { value: "preferences", icon: PaletteIcon, label: "Preferences" },
    { value: "notifications", icon: BellIcon, label: "Notifications" },
    { value: "security", icon: ShieldIcon, label: "Security" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full flex flex-col md:flex-row gap-6"
      >
        <div className="w-full md:w-52 flex-shrink-0 min-w-0">
          <TabsList className="flex flex-row md:flex-col flex-wrap md:flex-nowrap h-auto w-full bg-transparent space-y-0.5 gap-1 p-1 overflow-x-auto md:overflow-visible">
            {tabItems.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="justify-center md:justify-start shrink-0 md:w-full gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary h-9 text-sm px-3"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <div className="flex-1 min-w-0">
          <TabsContent value="profile" className="mt-0">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Profile</CardTitle>
                <CardDescription className="text-xs">
                  Your account information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                      {getInitials(userEmail)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{displayName}</p>
                    <p className="text-sm text-muted-foreground">{userEmail}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="display-name" className="text-sm">Display Name</Label>
                    <Input
                      id="display-name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userEmail}
                      disabled
                      className="max-w-sm opacity-60"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Email changes are managed through Supabase auth.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="mt-0">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Preferences</CardTitle>
                <CardDescription className="text-xs">
                  Customize your Billa experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-sm">Currency</Label>
                  <Select defaultValue="usd">
                    <SelectTrigger className="max-w-xs h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD ($)</SelectItem>
                      <SelectItem value="eur">EUR (&euro;)</SelectItem>
                      <SelectItem value="gbp">GBP (&pound;)</SelectItem>
                      <SelectItem value="inr">INR (&#8377;)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Theme</Label>
                  {mounted && (
                    <Select value={theme} onValueChange={setTheme}>
                      <SelectTrigger className="max-w-xs h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Date Format</Label>
                  <Select defaultValue="mdy">
                    <SelectTrigger className="max-w-xs h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-0">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Notifications</CardTitle>
                <CardDescription className="text-xs">
                  Control how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {[
                  {
                    id: "budget-alerts",
                    label: "Budget Alerts",
                    desc: "Notify when approaching budget limits",
                    defaultChecked: true,
                  },
                  {
                    id: "monthly-summary",
                    label: "Monthly Summary",
                    desc: "Monthly expense and savings report",
                    defaultChecked: true,
                  },
                  {
                    id: "bill-reminders",
                    label: "Bill Reminders",
                    desc: "Reminders for upcoming bill payments",
                    defaultChecked: true,
                  },
                  {
                    id: "tips",
                    label: "Tips & Insights",
                    desc: "Financial tips and spending insights",
                    defaultChecked: false,
                  },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor={item.id} className="text-sm font-medium cursor-pointer">
                        {item.label}
                      </Label>
                      <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch id={item.id} defaultChecked={item.defaultChecked} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-0">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Security</CardTitle>
                <CardDescription className="text-xs">
                  Manage your password and account security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Change Password</h3>
                  <Separator />
                  <div className="space-y-3 max-w-sm">
                    <div className="space-y-1.5">
                      <Label htmlFor="new-password" className="text-sm">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimum 8 characters"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="confirm-password" className="text-sm">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your new password"
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={handlePasswordChange}
                      disabled={isSavingPassword}
                    >
                      {isSavingPassword ? "Updating..." : "Update Password"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-semibold">Danger Zone</h3>
                  <Separator />
                  <p className="text-xs text-muted-foreground">
                    Permanently delete your account and all associated data.
                  </p>
                  <Button variant="destructive" size="sm">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
