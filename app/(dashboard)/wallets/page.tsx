//  Wallets/Accounts management page
"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	PlusIcon,
	MoreHorizontalIcon,
	PencilIcon,
	TrashIcon,
	TrendingUpIcon,
	TrendingDownIcon,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddWalletModal } from "@/components/wallets/add-wallet-modal";
import { EditWalletModal } from "@/components/wallets/edit-wallet-modal";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

interface WalletActivity {
	type: string;
	id: number;
	name: string;
	amount: number;
	date: string;
}

interface Wallet {
	id: number;
	name: string;
	balance: number;
	currency: string;
	type: string;
	icon: string;
	recentActivity: WalletActivity[];
}

//  Helper function to format currency
const formatCurrency = (amount: number, currency: string) => {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: currency,
	}).format(amount);
};

export default function WalletsPage() {
	const [wallets, setWallets] = useState<Wallet[]>([]);
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [currentWallet, setCurrentWallet] = useState<Wallet>();
	const supabase = createClient();

	const totalBalance = wallets.reduce(
		(sum, wallet) => sum + wallet.balance,
		0
	);

	//  Handle wallet deletion
	const handleDeleteWallet = async (id: number) => {
		const { data: txData, error: txError } = await supabase
			.from("transactions")
			.select("id")
			.eq("wallet_id", id)
			.limit(1);

		if (txError) {
			// Unexpected database read error
			toast.error("Could not verify wallet activity. Try again.");
			return;
		}

		if (txData && txData.length > 0) {
			toast.error(
				"Unable to delete wallet. Remove or reassign its transactions first."
			);
			return;
		}

		const { error } = await supabase.from("wallets").delete().eq("id", id);

		if (error) {
			toast.error("An error occurred. Try again later");
		} else {
			toast.success("Wallet deleted successfully!");
		}

		await fetchWallets();
	};

	//  Handle edit button click
	const handleEditClick = (wallet: Wallet) => {
		setCurrentWallet(wallet);
		setIsEditModalOpen(true);
	};

	// Fetch wallets + their recent activity (last 3 transactions)
	const fetchWallets = async () => {
		try {
			const {
				data: { user },
				error: userError,
			} = await supabase.auth.getUser();

			if (userError || !user) return false;

			// Fetch all wallets
			const { data: walletData, error: walletError } = await supabase
				.from("wallets")
				.select("*")
				.eq("user_id", user.id);

			if (walletError) {
				toast.error("Failed to load wallets");
				return false;
			}

			// For each wallet, grab the last 3 transactions
			const walletsWithActivity = await Promise.all(
				walletData.map(async (wallet) => {
					const { data: txData, error: txError } = await supabase
						.from("transactions")
						.select("id, name, amount, type, created_at")
						.eq("wallet_id", wallet.id)
						.order("created_at", { ascending: false })
						.limit(3);

					if (txError) {
						console.warn(
							"Activity load failed for wallet",
							wallet.id
						);
					}

					// Format for UI
					const formattedActivity =
						txData?.map((item) => ({
							id: item.id,
							name: item.name, // Use name instead of description
							amount: item.amount, // Keep amount for display
							type: item.type, // "income" or "expense"
							date: item.created_at,
						})) ?? [];

					return {
						...wallet,
						recentActivity: formattedActivity, // attach result
					};
				})
			);

			setWallets(walletsWithActivity);
			return true;
		} catch (e) {
			toast.error("Unexpected error loading wallets");
			return false;
		}
	};

	// Updated handleUpdateWallet with database refresh
	const handleUpdateWallet = async (updatedWallet: Wallet) => {
		try {
			const {
				data: { user },
				error: userError,
			} = await supabase.auth.getUser();

			if (userError || !user) {
				console.error("Failed to get user:", userError?.message);
				toast.error(
					"Authentication error. Please try logging in again."
				);
				return;
			}

			const { id, recentActivity, ...rest } = updatedWallet;
			const walletData = {
				...rest,
				user_id: user.id,
				currency: updatedWallet.currency,
				type: updatedWallet.type,
			};

			const { data, error } = await supabase
				.from("wallets")
				.update(walletData)
				.eq("id", id)
				.eq("user_id", user.id)
				.select();

			console.log("Error:", error?.message);
			if (error) {
				// console.error("Error updating wallet:", error.message);
				toast.error(`Failed to update wallet: ${error.message}`);
				return;
			}

			// Close modal first for better UX
			setIsEditModalOpen(false);

			// Refresh from database
			const refreshSuccess = await fetchWallets();

			if (refreshSuccess) {
				toast.success("Wallet updated successfully!");
			} else {
				toast.error(
					"Wallet updated, but failed to refresh the list. Please reload the page."
				);
			}
		} catch (error) {
			//console.error("Unexpected error updating wallet:", error);
			toast.error(
				"An unexpected error occurred while updating the wallet."
			);
		}
	};

	// Updated handleAddWallet with database refresh
	const handleAddWallet = async (newWallet: Wallet) => {
		try {
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

			const walletToInsert = {
				...newWallet,
				user_id: user.id, // Attach the current user's ID
			};

			const { data, error } = await supabase
				.from("wallets")
				.insert([walletToInsert])
				.select();

			if (error) {
				//console.error("Error inserting wallet:", error.message);
				toast.error(`Failed to add wallet: ${error.message}`);
				return;
			}

			// Close modal first
			setIsAddModalOpen(false);

			// Refresh from database
			const refreshSuccess = await fetchWallets();

			if (refreshSuccess) {
				toast.success("Wallet added successfully!");
			} else {
				toast.error(
					"Wallet added, but failed to refresh the list. Please reload the page."
				);
			}
		} catch (error) {
			//console.error("Unexpected error adding wallet:", error);
			toast.error(
				"An unexpected error occurred while adding the wallet."
			);
		}
	};

	// Update your useEffect to use the extracted function
	useEffect(() => {
		fetchWallets();
	}, []);
	return (
		<div>
			<div className="mb-8">
				<h1 className="text-3xl font-bold">Wallets & Accounts</h1>
				<p className="text-muted-foreground">
					Manage your financial accounts
				</p>
			</div>

			{/*  Total balance card */}
			<Card className="mb-8 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900">
				<CardHeader className="pb-2">
					<CardTitle className="text-xl text-green-700 dark:text-green-300">
						Total Balance
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-3xl font-bold text-green-700 dark:text-green-300">
						{formatCurrency(totalBalance, "USD")}
					</div>
					<p className="text-sm text-green-600/80 dark:text-green-400/80 mt-1">
						Across {wallets.length} accounts
					</p>
				</CardContent>
			</Card>

			{/*  Action button */}
			<div className="flex justify-end mb-6">
				<Button onClick={() => setIsAddModalOpen(true)}>
					<PlusIcon className="mr-2 h-4 w-4" />
					Add Wallet
				</Button>
			</div>

			{/*  Wallets grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{wallets.map((wallet) => (
					<Card key={wallet.id} className="overflow-hidden">
						<CardHeader className="pb-2">
							<div className="flex justify-between items-start">
								<div className="flex items-center space-x-2">
									<span className="text-2xl">
										{wallet.icon}
									</span>
									<div>
										<CardTitle>{wallet.name}</CardTitle>
										<Badge
											variant="outline"
											className="mt-1"
										>
											{wallet.type
												? wallet.type
														.charAt(0)
														.toUpperCase() +
												  wallet.type.slice(1)
												: "Unknown"}
										</Badge>
									</div>
								</div>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon">
											<MoreHorizontalIcon className="h-4 w-4" />
											<span className="sr-only">
												Actions
											</span>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem
											onClick={() =>
												handleEditClick(wallet)
											}
										>
											<PencilIcon className="mr-2 h-4 w-4" />
											Edit
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() =>
												handleDeleteWallet(wallet.id)
											}
											className="text-red-600 dark:text-red-400"
										>
											<TrashIcon className="mr-2 h-4 w-4" />
											Delete
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</CardHeader>
						<CardContent>
							<div
								className={cn(
									"text-2xl font-bold",
									wallet.balance >= 0
										? "text-green-600 dark:text-green-400"
										: "text-red-600 dark:text-red-400"
								)}
							>
								{formatCurrency(
									wallet.balance,
									wallet.currency
								)}
							</div>
						</CardContent>
						<div className="px-6 py-3 bg-muted/50">
							<h4 className="text-sm font-medium mb-2">
								Recent Activity
							</h4>
							<div className="space-y-2">
								{wallet.recentActivity
									.slice(0, 3)
									.map((activity) => (
										<div
											key={activity.id}
											className="flex justify-between items-center text-sm"
										>
											{/* Show name */}
											<div className="truncate max-w-[70%]">
												{activity.name}
											</div>

											{/* Type-based direction arrow */}
											<div className="flex items-center">
												{activity.type === "income" ? (
													<TrendingUpIcon className="h-3 w-3 text-green-500 mr-1" />
												) : (
													<TrendingDownIcon className="h-3 w-3 text-red-500 mr-1" />
												)}

												{/* Amount formatting */}
												<span
													className={
														activity.type ===
														"income"
															? "text-green-600"
															: "text-red-600"
													}
												>
													{activity.type === "income"
														? "+"
														: "-"}
													{formatCurrency(
														activity.amount,
														wallet.currency
													)}
												</span>
											</div>
										</div>
									))}
							</div>
						</div>
					</Card>
				))}
			</div>

			{/*  Add Wallet Modal */}
			<AddWalletModal
				isOpen={isAddModalOpen}
				onClose={() => setIsAddModalOpen(false)}
				onAdd={handleAddWallet}
			/>

			{/*  Edit Wallet Modal */}
			{currentWallet && (
				<EditWalletModal
					isOpen={isEditModalOpen}
					onClose={() => setIsEditModalOpen(false)}
					wallet={currentWallet}
					onUpdate={handleUpdateWallet}
				/>
			)}
		</div>
	);
}
