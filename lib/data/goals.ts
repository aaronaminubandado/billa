import type { SupabaseClient } from "@supabase/supabase-js";
import type { Goal } from "@/lib/types";
import { requireUserId } from "@/lib/data/auth";
import { sumWalletBalance } from "@/lib/data/transactions";

export interface GoalInput {
	name: string;
	type: "savings" | "debt";
	targetAmount: number;
	currentAmount: number;
	dueDate: string;
	icon: string;
	color: string;
	wallet_id?: string | null;
}

export type GoalUpdateInput = Goal & {
	targetAmount?: number;
	currentAmount?: number;
	dueDate?: string;
};

export async function listGoalsWithWalletBalances(
	supabase: SupabaseClient
): Promise<Goal[]> {
	const userId = await requireUserId(supabase);

	const { data, error } = await supabase
		.from("goals")
		.select("*")
		.eq("user_id", userId)
		.order("created_at", { ascending: false });

	if (error) {
		throw error;
	}

	return Promise.all(
		(data ?? []).map(async (goal) => {
			const row = goal as Goal & { due_date?: string; deadline?: string };
			const dueDate = row.due_date ?? row.deadline ?? "";

			if (row.type === "savings" && row.wallet_id) {
				const balance = await sumWalletBalance(supabase, row.wallet_id);
				return { ...row, due_date: dueDate, current_amount: balance };
			}

			return { ...row, due_date: dueDate };
		})
	);
}

export async function createGoal(supabase: SupabaseClient, goalInput: GoalInput) {
	const userId = await requireUserId(supabase);

	const { error } = await supabase.from("goals").insert({
		user_id: userId,
		wallet_id: goalInput.type === "savings" ? goalInput.wallet_id : null,
		name: goalInput.name,
		target_amount: goalInput.targetAmount,
		current_amount: goalInput.type === "savings" ? 0 : goalInput.currentAmount,
		due_date: goalInput.dueDate,
		icon: goalInput.icon,
		color: goalInput.color,
		type: goalInput.type,
	});

	if (error) {
		throw error;
	}
}

export async function updateGoal(
	supabase: SupabaseClient,
	goal: GoalUpdateInput
) {
	await requireUserId(supabase);

	const parsedCurrentAmount = Number(
		goal.current_amount ?? goal.currentAmount ?? 0
	);
	const parsedTargetAmount = Number(goal.target_amount ?? goal.targetAmount ?? 0);
	const dueDate = goal.due_date ?? goal.dueDate ?? "";

	const { error } = await supabase
		.from("goals")
		.update({
			name: goal.name,
			target_amount: parsedTargetAmount,
			current_amount: parsedCurrentAmount,
			due_date: dueDate,
			icon: goal.icon,
			color: goal.color,
		})
		.eq("id", goal.id);

	if (error) {
		throw error;
	}
}

export async function deleteGoal(supabase: SupabaseClient, goalId: string) {
	await requireUserId(supabase);

	const { error } = await supabase.from("goals").delete().eq("id", goalId);

	if (error) {
		throw error;
	}
}
