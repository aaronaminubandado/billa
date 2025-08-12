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
			filtered = filtered.filter(
				(transaction) =>
					transaction.name
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					transaction.category.name
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					transaction.wallet.name
						.toLowerCase()
						.includes(searchTerm.toLowerCase())
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
					transaction.category.id === Number.parseInt(categoryFilter)
			);
		}

		// Wallet filter
		if (walletFilter !== "all") {
			filtered = filtered.filter(
				(transaction) =>
					transaction.wallet.id === Number.parseInt(walletFilter)
			);
		}

		setFilteredTransactions(filtered);
		console.log("🔍 Filtered transactions:", filtered.length, "results");
	}, [transactions, searchTerm, typeFilter, categoryFilter, walletFilter]);

	// Add transaction function
	// Add a new transaction to the database
	const handleAddTransaction = async (newTransaction: any) => {
		try {
			console.log("New Transactions: ", newTransaction);
			// Get the currently authenticated user
			const {
				data: { user },
				error: userError,
			} = await supabase.auth.getUser();

			if (userError || !user) {
				//console.error("Failed to get user:", userError?.message);
				toast.error(
					"Authentication error. Please try logging in again."
				);
				return;
			}

			const transactionToInsert = {
				...newTransaction,
				user_id: user.id,
			};

			const { data, error } = await supabase
				.from("transactions")
				.insert([transactionToInsert])
				.select();

			if (error) {
				console.error("Error inserting transaction:", error.message);
				toast.error(`Failed to add transactions: ${error.message}`);
				return;
			}

			// Close modal first
			setIsAddModalOpen(false);

			// Refresh from database
			//await fetchTransactions();
		} catch (error) {
			console.error("Unexpected error adding transactions:", error);
			toast.error(
				"An unexpected error occurred while adding the transaction."
			);
		}
	};

	// SIMULATED: Edit transaction function
	const handleEditTransaction = (updatedTransaction: any) => {
		console.log("✏️ Editing transaction:", updatedTransaction);

		// Simulate API call delay
		setTimeout(() => {
			const updatedTransactions = transactions.map((transaction) =>
				transaction.id === updatedTransaction.id
					? {
							...updatedTransaction,
							updatedAt: new Date().toISOString(),
					  }
					: transaction
			);

			setTransactions(updatedTransactions);

			console.log(
				"✅ Transaction updated successfully:",
				updatedTransaction
			);
			console.log(
				"📊 Updated transactions list:",
				updatedTransactions.length,
				"total transactions"
			);

			setIsEditModalOpen(false);
			setEditingTransaction(null);
		}, 500);
	};

    //Delete transaction
	// SIMULATED: Delete transaction function
	const handleDeleteTransaction = (transactionId: number) => {
		console.log("🗑️ Deleting transaction with ID:", transactionId);

		// Simulate API call delay
		setTimeout(() => {
			const updatedTransactions = transactions.filter(
				(transaction) => transaction.id !== transactionId
			);
			setTransactions(updatedTransactions);

			console.log("✅ Transaction deleted successfully");
			console.log(
				"📊 Updated transactions list:",
				updatedTransactions.length,
				"total transactions"
			);
		}, 300);
	};

	// Handle edit transaction
	const handleEditClick = (transaction: any) => {
		console.log("📝 Opening edit modal for transaction:", transaction);
		setEditingTransaction(transaction);
		setIsEditModalOpen(true);
	};

	// Clear all filters
	const handleClearFilters = () => {
		console.log("🧹 Clearing all filters");
		setSearchTerm("");
		setTypeFilter("all");
		setCategoryFilter("all");
		setWalletFilter("all");
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">
						Transactions
					</h1>
					<p className="text-muted-foreground">
						Track your income and expenses
					</p>
				</div>

				<Button onClick={() => setIsAddModalOpen(true)}>
					<PlusIcon className="h-4 w-4 mr-2" />
					Add Transaction
				</Button>
			</div>

			{/* Summary Cards */}
			<TransactionsSummary transactions={filteredTransactions} />

			{/* Filters */}
			<div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
				<div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
					{/* Search */}
					<div className="relative w-full sm:w-64">
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
						<SelectTrigger className="w-full sm:w-32">
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
						<SelectTrigger className="w-full sm:w-40">
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
						<SelectTrigger className="w-full sm:w-40">
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

				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={handleClearFilters}
					>
						Clear Filters
					</Button>
					<Button variant="outline" size="sm">
						<FilterIcon className="h-4 w-4 mr-2" />
						Advanced
					</Button>
				</div>
			</div>

			{/* Transactions List */}
			<TransactionsList
				transactions={filteredTransactions}
				onEdit={handleEditClick}
				onDelete={handleDeleteTransaction}
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
