// Main Transactions Content component
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, SearchIcon, FilterIcon } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { AddTransactionModal } from "@/components/transactions/add-transaction-modal";
import { EditTransactionModal } from "@/components/transactions/edit-transaction-modal";
import { TransactionsList } from "@/components/transactions/transactions-list";
import { TransactionsSummary } from "@/components/transactions/transactions-summary";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

export function TransactionsContent() {
	const [transactions, setTransactions] = useState<any[]>([]);
	const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [editingTransaction, setEditingTransaction] = useState<any>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [typeFilter, setTypeFilter] = useState("all");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [walletFilter, setWalletFilter] = useState("all");
	const [categories, setCategories] = useState<any[]>([]);
	const [wallets, setWallets] = useState<any[]>([]);
	const supabase = createClient();

	const fetchTransactions = async (supabase: any, userId: string) => {
		try {
			const { data, error } = await supabase
				.from("transactions")
				.select(
					`
        *,
        category:categories (
          id,
          name,
          icon,
          color
        ),
        wallet:wallets (
          id,
          name,
          type,
          balance,
          color
        )
      `
				)
				.eq("user_id", userId)
				.order("date", { ascending: false });

			if (error) {
				console.error("Error fetching transactions:", error.message);
				toast.error("Failed to fetch transactions. Please try again.");
				return [];
			}

			console.log("Transactions fetched:", data.length);
			return data;
		} catch (error) {
			console.error("Unexpected error fetching transactions:", error);
			toast.error(
				"An unexpected error occurred while fetching transactions."
			);
			return [];
		}
	};

	// Initialize with sample data
	useEffect(() => {
		const loadInitialData = async () => {
			const {
				data: { user },
				error,
			} = await supabase.auth.getUser();

			if (error || !user) {
				toast.error("Authentication failed. Please log in again.");
				return;
			}

			const [fetchedTransactions, categoryRes, walletRes] =
				await Promise.all([
					fetchTransactions(supabase, user.id),

					supabase
						.from("categories")
						.select("*")
						.eq("user_id", user.id),

					supabase.from("wallets").select("*").eq("user_id", user.id),
				]);

			if (categoryRes.error) {
				toast.error("Failed to load categories.");
				console.error(categoryRes.error.message);
			} else {
				setCategories(categoryRes.data || []);
			}

			if (walletRes.error) {
				toast.error("Failed to load wallets.");
				console.error(walletRes.error.message);
			} else {
				setWallets(walletRes.data || []);
			}

			setTransactions(fetchedTransactions);
			setFilteredTransactions(fetchedTransactions);
		};

		loadInitialData();
	}, []);

	// Filter transactions based on search and filters
	useEffect(() => {
		let filtered = transactions;

		// Search filter
		if (searchTerm) {
			const term = searchTerm.toLowerCase();
			filtered = filtered.filter(
				(transaction) =>
					transaction.name?.toLowerCase().includes(term) ||
					transaction.category?.name?.toLowerCase().includes(term) ||
					transaction.wallet?.name?.toLowerCase().includes(term)
			);
		}

		// Type filter
		if (typeFilter !== "all") {
			filtered = filtered.filter(
				(transaction) => transaction.type === typeFilter
			);
		}

		// Category filter
		if (categoryFilter !== "all") {
			filtered = filtered.filter(
				(transaction) =>
					transaction.category?.id?.toString() === categoryFilter
			);
		}

		if (walletFilter !== "all") {
			filtered = filtered.filter(
				(transaction) =>
					transaction.wallet?.id?.toString() === walletFilter
			);
		}

		setFilteredTransactions(filtered);
	}, [transactions, searchTerm, typeFilter, categoryFilter, walletFilter]);

	// Add transaction function
	const handleAddTransaction = async (newTransaction: any) => {
		try {
			const {
				data: { user },
				error: userError,
			} = await supabase.auth.getUser();
			if (userError || !user) {
				toast.error("Authentication error. Please log in again.");
				return;
			}

			const transactionToInsert = {
				...newTransaction,
				user_id: user.id,
			};

			const { error } = await supabase
				.from("transactions")
				.insert([transactionToInsert]);

			if (error) {
				toast.error(`Failed to add transaction`);
				return;
			}

			toast.success("Transaction added successfully.");
			setIsAddModalOpen(false);

			//refresh transactions from the db
			const refreshedTransactions = await fetchTransactions(
				supabase,
				user.id
			);
			setTransactions(refreshedTransactions);
			setFilteredTransactions(refreshedTransactions);
		} catch (error) {
			console.error(error);
			toast.error("Unexpected error while adding the transaction.");
		}
	};

	// Edit transaction function
	const handleEditTransaction = async (updatedTransaction: any) => {
		try {
			const { category, wallet, ...transactionColumns } =
				updatedTransaction;

			const cleanedTransaction = {
				...transactionColumns,
				category_id: updatedTransaction.category_id,
				wallet_id: updatedTransaction.wallet_id,
			};

			const { error } = await supabase
				.from("transactions")
				.update(cleanedTransaction)
				.eq("id", updatedTransaction.id);

			if (error) {
				toast.error(`Failed to update transaction`);
				return;
			}

			toast.success("Transaction updated successfully.");
			setIsEditModalOpen(false);
			setEditingTransaction(null);

			//Refresh transactions from the database
			//NOTE: Try to find a better way to do this
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (user) {
				const refreshedTransactions = await fetchTransactions(
					supabase,
					user.id
				);
				setTransactions(refreshedTransactions);
				setFilteredTransactions(refreshedTransactions);
			}
		} catch (error) {
			console.error(error);
			toast.error("Unexpected error while updating transactions");
		}
	};

	//Cancel transaction from DB
	const handleCancelTransaction = async (transactionId: string) => {
		try {
			const { error } = await supabase
				.from("transactions")
				.update({ status: "canceled" }) // <-- NEW: update status
				.eq("id", transactionId);

			if (error) {
				toast.error(`Failed to cancel transaction`);
				return;
			}

			toast.success("Transaction canceled successfully.");

			// Refresh list
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (user) {
				const refreshedTransactions = await fetchTransactions(
					supabase,
					user.id
				);
				setTransactions(refreshedTransactions);
				setFilteredTransactions(refreshedTransactions);
			}
		} catch (error) {
			toast.error("Unexpected error while canceling transaction.");
		}
	};

	// Handle edit transaction
	const handleEditClick = (transaction: any) => {
		setEditingTransaction(transaction);
		setIsEditModalOpen(true);
	};

	// Clear all filters
	const handleClearFilters = () => {
		setSearchTerm("");
		setTypeFilter("all");
		setCategoryFilter("all");
		setWalletFilter("all");
	};

	return (
		<div className="space-y-5">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">
						Transactions
					</h1>
					<p className="text-sm text-muted-foreground">
						Track your income and expenses
					</p>
				</div>

				<Button onClick={() => setIsAddModalOpen(true)} size="sm" className="h-9 gap-2">
					<PlusIcon className="h-3.5 w-3.5" />
					Add Transaction
				</Button>
			</div>

			{/* Summary Cards */}
			<TransactionsSummary transactions={filteredTransactions} />

			{/* Filters */}
			<div className="flex flex-col gap-3 sm:gap-4">
				<div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 w-full min-w-0">
					{/* Search */}
					<div className="relative w-full min-w-0 sm:max-w-[16rem]">
						<SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
						<Input
							placeholder="Search transactions..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10"
						/>
					</div>

					{/* Type Filter */}
					<Select value={typeFilter} onValueChange={setTypeFilter}>
						<SelectTrigger className="w-full min-w-0 sm:w-32">
							<SelectValue placeholder="Type" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Types</SelectItem>
							<SelectItem value="income">Income</SelectItem>
							<SelectItem value="expense">Expense</SelectItem>
						</SelectContent>
					</Select>

					{/* Category Filter */}
					<Select
						value={categoryFilter}
						onValueChange={setCategoryFilter}
					>
						<SelectTrigger className="w-full min-w-0 sm:w-40">
							<SelectValue placeholder="Category" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Categories</SelectItem>
							{categories.map((category) => (
								<SelectItem
									key={category.id}
									value={category.id.toString()}
								>
									<div className="flex items-center">
										<span className="mr-2">
											{category.icon}
										</span>
										<span>{category.name}</span>
									</div>
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					{/* Wallet Filter */}
					<Select
						value={walletFilter}
						onValueChange={setWalletFilter}
					>
						<SelectTrigger className="w-full min-w-0 sm:w-40">
							<SelectValue placeholder="Wallet" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Wallets</SelectItem>
							{wallets.map((wallet) => (
								<SelectItem
									key={wallet.id}
									value={wallet.id.toString()}
								>
									{wallet.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="flex flex-wrap gap-2">
					<Button
						variant="outline"
						size="sm"
						className="h-9"
						onClick={handleClearFilters}
					>
						Clear Filters
					</Button>
					<TooltipProvider delayDuration={0}>
						<Tooltip>
							<TooltipTrigger asChild>
								<span>
									<Button variant="outline" size="sm" className="h-9" disabled>
										<FilterIcon className="h-3.5 w-3.5 sm:mr-2" />
										<span className="hidden sm:inline">Advanced</span>
									</Button>
								</span>
							</TooltipTrigger>
							<TooltipContent>Advanced filters coming soon</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			</div>

			{/* Transactions List */}
			<TransactionsList
				transactions={filteredTransactions}
				onEdit={handleEditClick}
				onCancel={handleCancelTransaction}
			/>

			{/* Modals */}
			<AddTransactionModal
				isOpen={isAddModalOpen}
				onClose={() => setIsAddModalOpen(false)}
				onAdd={handleAddTransaction}
			/>

			<EditTransactionModal
				isOpen={isEditModalOpen}
				onClose={() => {
					setIsEditModalOpen(false);
					setEditingTransaction(null);
				}}
				transaction={editingTransaction}
				onUpdate={handleEditTransaction}
			/>
		</div>
	);
}
