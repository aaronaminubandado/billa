"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  formSchema,
  loginSchema,
  parseAuthForm,
} from "@/lib/validation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const parsed = parseAuthForm(loginSchema, {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    return parsed.result;
  }

  const supabase = await createClient();
  const { email, password } = parsed.data;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");

  return { success: true };
}

export async function signup(formData: FormData) {
  const parsed = parseAuthForm(formSchema, {
    username: String(formData.get("username") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    return parsed.result;
  }

  const supabase = await createClient();
  const { username, email, password } = parsed.data;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: username },
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // Profile row may not insert if email confirmation is required (user null).
  if (data.user) {
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: data.user.id,
      name: username,
    });

    if (profileError) {
      console.error("Failed to create profile:", profileError.message);
    }
  }

  revalidatePath("/", "layout");

  return {
    success: true,
    message:
      "Signup successful! Please check your email to confirm your account.",
  };
}

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error(error.message);
    redirect("/login");
  }

  revalidatePath("/", "layout");
  redirect("/login");
}
