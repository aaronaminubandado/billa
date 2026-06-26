import type { SupabaseClient } from "@supabase/supabase-js";
import type { Wallet } from "@/lib/types";
import { requireUserId } from "@/lib/data/auth";
import { listRecentByWallet, walletHasTransactions } from "@/lib/data/transactions";

export interface WalletWithActivity extends Wallet {
	recentActivity: Array<{
		type: string;
		id: string;
		name: string;
		amount: number;
		date: string;
	}>;
}

export async function listWalletsWithRecentActivity(
	supabase: SupabaseClient
): Promise<WalletWithActivity[]> {
	const userId = await requireUserId(supabase);

	const { data: walletData, error } = await supabase
		.from("wallets")
		.select("*")
		.eq("user_id", userId);

	if (error) {
		throw error;
	}

	return Promise.all(
		(walletData ?? []).map(async (wallet) => {
			const txData = await listRecentByWallet(supabase, wallet.id as string);

			return {
				...(wallet as Wallet),
				recentActivity: txData.map((item) => ({
					id: item.id as string,
					name: item.name as string,
					amount: Number(item.amount),
					type: item.type as string,
					date: item.created_at as string,
				})),
			};
		})
	);
}

export async function createWallet(
	supabase: SupabaseClient,
	wallet: Omit<Wallet, "id" | "user_id" | "created_at" | "updated_at">
) {
	const userId = await requireUserId(supabase);

	const { error } = await supabase.from("wallets").insert([
		{
			...wallet,
			user_id: userId,
		},
	]);

	if (error) {
		throw error;
	}
}

export async function updateWallet(
	supabase: SupabaseClient,
	wallet: Pick<
		Wallet,
		"id" | "name" | "balance" | "currency" | "type" | "icon" | "color" | "include_in_total" | "notes"
	>
) {
	const userId = await requireUserId(supabase);

	const { error } = await supabase
		.from("wallets")
		.update({
			name: wallet.name,
			balance: wallet.balance,
			currency: wallet.currency,
			type: wallet.type,
			icon: wallet.icon,
			color: wallet.color,
			include_in_total: wallet.include_in_total,
			notes: wallet.notes,
			user_id: userId,
		})
		.eq("id", wallet.id)
		.eq("user_id", userId);

	if (error) {
		throw error;
	}
}

export async function deleteWallet(supabase: SupabaseClient, walletId: string) {
	const userId = await requireUserId(supabase);

	const hasTransactions = await walletHasTransactions(supabase, walletId);
	if (hasTransactions) {
		throw new Error("WALLET_HAS_TRANSACTIONS");
	}

	const { error } = await supabase
		.from("wallets")
		.delete()
		.eq("id", walletId)
		.eq("user_id", userId);

	if (error) {
		throw error;
	}
}
