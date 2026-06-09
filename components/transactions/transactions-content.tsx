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
import type {
	Category,
	NewTransactionPayload,
	Transaction,
	Wallet,
} from "@/lib/types";
import {
	cancelTransaction,
	insertTransaction,
	listCategoriesForUser,
	listTransactionsWithRelations,
	listWalletsForUser,
	updateTransaction,
} from "@/lib/data/transactions";
import { AuthRequiredError } from "@/lib/data/auth";

export function TransactionsContent() {
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [filteredTransactions, setFilteredTransactions] = useState<
		Transaction[]
	>([]);
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [editingTransaction, setEditingTransaction] =
		useState<Transaction | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [typeFilter, setTypeFilter] = useState("all");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [walletFilter, setWalletFilter] = useState("all");
	const [categories, setCategories] = useState<Category[]>([]);
	const [wallets, setWallets] = useState<Wallet[]>([]);
	const supabase = createClient();

	const refreshTransactions = async () => {
		try {
			return await listTransactionsWithRelations(supabase);
		} catch (error) {
			if (error instanceof AuthRequiredError) {
				toast.error(error.message);
			} else {
				toast.error("Failed to fetch transactions. Please try again.");
			}
			return [];
		}
	};

	useEffect(() => {
		const loadInitialData = async () => {
			try {
				const [fetchedTransactions, fetchedCategories, fetchedWallets] =
					await Promise.all([
						listTransactionsWithRelations(supabase),
						listCategoriesForUser(supabase),
						listWalletsForUser(supabase),
					]);

				setCategories(fetchedCategories);
				setWallets(fetchedWallets);
				setTransactions(fetchedTransactions);
				setFilteredTransactions(fetchedTransactions);
			} catch (error) {
				if (error instanceof AuthRequiredError) {
					toast.error(error.message);
				} else {
					toast.error("Authentication failed. Please log in again.");
				}
			}
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
	const handleAddTransaction = async (newTransaction: NewTransactionPayload) => {
		try {
			await insertTransaction(supabase, newTransaction);
			toast.success("Transaction added successfully.");
			setIsAddModalOpen(false);
			const refreshedTransactions = await refreshTransactions();
			setTransactions(refreshedTransactions);
			setFilteredTransactions(refreshedTransactions);
		} catch (error) {
			console.error(error);
			toast.error("Unexpected error while adding the transaction.");
		}
	};

	const handleEditTransaction = async (updatedTransaction: Transaction) => {
		try {
			await updateTransaction(supabase, updatedTransaction);
			toast.success("Transaction updated successfully.");
			setIsEditModalOpen(false);
			setEditingTransaction(null);
			const refreshedTransactions = await refreshTransactions();
			setTransactions(refreshedTransactions);
			setFilteredTransactions(refreshedTransactions);
		} catch (error) {
			console.error(error);
			toast.error("Unexpected error while updating transactions");
		}
	};

	const handleCancelTransaction = async (transactionId: string) => {
		try {
			await cancelTransaction(supabase, transactionId);
			toast.success("Transaction canceled successfully.");
			const refreshedTransactions = await refreshTransactions();
			setTransactions(refreshedTransactions);
			setFilteredTransactions(refreshedTransactions);
		} catch {
			toast.error("Unexpected error while canceling transaction.");
		}
	};

	// Handle edit transaction
	const handleEditClick = (transaction: Transaction) => {
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
