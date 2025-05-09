import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { createClient } from "./utils/supabase/server";

export async function middleware(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    const authRoutes = ["/login", "/register", "forgot-password"].includes(
      request.nextUrl.pathname
    );

    if (user && authRoutes) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (error) {
    //   console.error("Supabase auth error:", error.message);
    }
  } catch (error) {
    console.error("Middleware error", error);
  }
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
