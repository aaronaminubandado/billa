import type { SupabaseClient } from "@supabase/supabase-js";

export class AuthRequiredError extends Error {
  constructor(message = "Authentication required.") {
    super(message);
    this.name = "AuthRequiredError";
  }
}

export async function requireUserId(
  supabase: SupabaseClient
): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new AuthRequiredError(error?.message);
  }

  return user.id;
}
