import type { SupabaseClient } from "@supabase/supabase-js";
import type { Category } from "@/lib/types";
import { requireUserId } from "@/lib/data/auth";

export interface CategoryWithCount extends Category {
  transactionCount: number;
}

export async function listCategoriesWithCounts(
  supabase: SupabaseClient
): Promise<CategoryWithCount[]> {
  const userId = await requireUserId(supabase);

  const { data, error } = await supabase
    .from("categories")
    .select(
      `
      id, name, type, color, icon,
      transactions:transactions(count)
    `
    )
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  return (data ?? []).map((category) => ({
    id: category.id,
    user_id: userId,
    name: category.name,
    type: category.type as Category["type"],
    color: category.color,
    icon: category.icon,
    transactionCount: category.transactions?.[0]?.count ?? 0,
  }));
}

export async function createCategory(
  supabase: SupabaseClient,
  category: Pick<Category, "name" | "type" | "color" | "icon">
) {
  const userId = await requireUserId(supabase);

  const { error } = await supabase
    .from("categories")
    .insert([{ ...category, user_id: userId }]);

  if (error) {
    throw error;
  }
}

export async function updateCategory(
  supabase: SupabaseClient,
  category: Pick<Category, "id" | "name" | "type" | "color" | "icon">
) {
  const userId = await requireUserId(supabase);

  const { error } = await supabase
    .from("categories")
    .update({
      name: category.name,
      type: category.type,
      color: category.color,
      icon: category.icon,
      user_id: userId,
    })
    .eq("id", category.id)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}

export async function deleteCategory(
  supabase: SupabaseClient,
  categoryId: string
) {
  const userId = await requireUserId(supabase);

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}
