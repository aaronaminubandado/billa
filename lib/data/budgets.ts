import type { SupabaseClient } from "@supabase/supabase-js";
import { requireUserId } from "@/lib/data/auth";
import { sumCategoryExpensesInPeriod } from "@/lib/data/transactions";
import type { BudgetListItem } from "@/lib/types";

export interface BudgetCategory {
	id: string;
	name: string;
	icon: string;
	color: string;
}

export interface BudgetData {
	category: BudgetCategory;
	budgets: BudgetListItem[];
}

export interface NewBudgetInput {
	categoryId: string;
	amount: number;
	period: string;
}

export interface EditBudgetInput {
	id: string;
	amount: number;
	period: string;
}

function getBudgetPeriodRange(period: string, startDate: string) {
	const rangeStart = new Date(startDate);
	let rangeEnd = new Date();

	switch (period) {
		case "weekly":
			rangeEnd = new Date(rangeStart);
			rangeEnd.setDate(rangeStart.getDate() + 7);
			break;
		case "monthly":
			rangeEnd = new Date(rangeStart);
			rangeEnd.setMonth(rangeStart.getMonth() + 1);
			break;
		case "yearly":
			rangeEnd = new Date(rangeStart);
			rangeEnd.setFullYear(rangeStart.getFullYear() + 1);
			break;
	}

	return { rangeStart, rangeEnd };
}

export async function listBudgetsGroupedByCategory(
	supabase: SupabaseClient
): Promise<BudgetData[]> {
	const userId = await requireUserId(supabase);

	const { data: budgets, error } = await supabase
		.from("budgets")
		.select("*, category:categories(*)")
		.eq("user_id", userId)
		.order("created_at", { ascending: false });

	if (error) {
		throw error;
	}

	const grouped: BudgetData[] = [];

	for (const budget of budgets ?? []) {
		const cat = budget.category as BudgetCategory;
		const { rangeStart, rangeEnd } = getBudgetPeriodRange(
			budget.period as string,
			budget.start_date as string
		);
		const used = await sumCategoryExpensesInPeriod(
			supabase,
			budget.category_id as string,
			rangeStart,
			rangeEnd
		);

		const budgetItem: BudgetListItem = {
			id: budget.id as string,
			name: (budget.name as string) ?? cat.name,
			amount: parseFloat(String(budget.amount)),
			used,
			period: budget.period as string,
		};

		const group = grouped.find((g) => g.category.id === cat.id);
		if (group) {
			group.budgets.push(budgetItem);
		} else {
			grouped.push({
				category: {
					id: cat.id,
					name: cat.name,
					icon: cat.icon,
					color: cat.color,
				},
				budgets: [budgetItem],
			});
		}
	}

	return grouped;
}

export async function createBudget(
	supabase: SupabaseClient,
	newBudget: NewBudgetInput
) {
	const userId = await requireUserId(supabase);

	const { error } = await supabase.from("budgets").insert([
		{
			user_id: userId,
			name: "Budget",
			amount: newBudget.amount,
			category_id: newBudget.categoryId,
			period: newBudget.period,
			start_date: new Date().toISOString(),
		},
	]);

	if (error) {
		throw error;
	}
}

export async function updateBudget(
	supabase: SupabaseClient,
	updatedBudget: EditBudgetInput
) {
	const userId = await requireUserId(supabase);

	const { error } = await supabase
		.from("budgets")
		.update({
			amount: updatedBudget.amount,
			period: updatedBudget.period,
		})
		.eq("id", updatedBudget.id)
		.eq("user_id", userId);

	if (error) {
		throw error;
	}
}

export async function deleteBudget(
	supabase: SupabaseClient,
	budgetId: string
) {
	const userId = await requireUserId(supabase);

	const { error } = await supabase
		.from("budgets")
		.delete()
		.eq("id", budgetId)
		.eq("user_id", userId);

	if (error) {
		throw error;
	}
}
