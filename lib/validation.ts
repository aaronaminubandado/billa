import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
});

export type LoginFormData = z.infer<typeof loginSchema>;


export const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});


export type SignupFormData = z.infer<typeof formSchema>;

export type AuthActionResult =
  | { success: true; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

export function parseAuthForm<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
):
  | { success: true; data: z.infer<T> }
  | { success: false; result: AuthActionResult } {
  const parsed = schema.safeParse(data);

  if (parsed.success) {
    return { success: true, data: parsed.data };
  }

  const fieldErrors = Object.fromEntries(
    parsed.error.issues.map((issue) => [
      issue.path.join('.'),
      issue.message,
    ])
  );

  return {
    success: false,
    result: {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Validation failed',
      fieldErrors,
    },
  };
}
