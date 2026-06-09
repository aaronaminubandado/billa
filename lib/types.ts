export interface Wallet {
	id: string;
	user_id: string;
	name: string;
	balance: number;
	currency: string;
	type: string;
	icon: string;
	color?: string;
	include_in_total?: boolean;
	notes?: string;
	created_at: string;
	updated_at?: string;
}

export interface Category {
	id: string;
	user_id: string;
	name: string;
	type: "income" | "expense";
	color: string;
	icon: string;
}

export interface Transaction {
	id: string;
	user_id: string;
	type: "income" | "expense";
	name: string;
	amount: number;
	description?: string;
	category_id: string;
	wallet_id: string;
	date: string;
	recurring: boolean;
	recurring_frequency?: string;
	notes?: string;
	status?: string;
	created_at: string;
	updated_at?: string;
	category?: Category;
	wallet?: Wallet;
}

export interface Goal {
	id: string;
	user_id: string;
	name: string;
	target_amount: number;
	current_amount: number;
	due_date: string;
	type: "savings" | "debt";
	wallet_id: string | null;
	icon: string;
	color: string;
	created_at: string;
}

export interface Budget {
	id: string;
	user_id: string;
	name: string;
	amount: number;
	category_id: string;
	period: string;
	start_date: string;
	created_at: string;
}

export interface WalletActivity {
	type: string;
	id: string;
	name: string;
	amount: number;
	date: string;
}

export type NewTransactionPayload = {
	type: "income" | "expense";
	name: string;
	amount: number;
	category_id: string;
	wallet_id: string;
	date: string;
	recurring: boolean;
	recurring_frequency: string | null;
	notes: string;
};

export interface BudgetListItem {
	id: string;
	name: string;
	amount: number;
	used: number;
	period: string;
}
