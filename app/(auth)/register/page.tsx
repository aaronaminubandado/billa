// Enhanced register page with dark mode support
"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaTwitter } from "react-icons/fa";
import { FaMeta } from "react-icons/fa6";
import { signup } from "../actions";

export default function RegisterPage() {
  return (
    // Updated background and text colors to support dark mode
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          {/* <div className="flex justify-center mb-2">
            <img src="/Billa.png" alt="Billa Logo" className="h-12 w-auto" />
          </div> */}
          <h1 className="text-3xl font-bold text-green-500">Billa</h1>
          <p className="text-muted-foreground">Personal Expense Tracker</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Create an account
            </CardTitle>
            <CardDescription className="text-center">
              Enter your details to create your Billa account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              {/* Updated input to respect dark mode */}
              <Input
                id="username"
                name="username"
                placeholder="johndoe"
                required
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              {/* Updated input to respect dark mode */}
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="john@example.com"
                required
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              {/* Updated input to respect dark mode */}
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="bg-background"
              />
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters long
              </p>
            </div>
            <Button className="w-full bg-green-500 hover:bg-green-600"
            formAction={signup}>
              Create Account
            </Button>
            </form>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Button variant="outline" className="w-full">
                <FcGoogle className="mr-2 h-4 w-4" />
                Google
              </Button>
              <Button variant="outline" className="w-full">
                <FaMeta className="mr-2 h-4 w-4" />
                Meta
              </Button>
              <Button variant="outline" className="w-full">
                <FaTwitter className="mr-2 h-4 w-4 text-blue-400" />
                Twitter
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-green-500 hover:underline">
                Login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
