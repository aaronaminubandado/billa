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
	WalletIcon,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddWalletModal } from "@/components/wallets/add-wallet-modal";
import { EditWalletModal } from "@/components/wallets/edit-wallet-modal";
import { cn, formatCurrency } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
	createWallet,
	deleteWallet,
	listWalletsWithRecentActivity,
	updateWallet,
	type WalletWithActivity,
} from "@/lib/data/wallets";
import { AuthRequiredError } from "@/lib/data/auth";

type Wallet = WalletWithActivity;

export default function WalletsPage() {
	const [wallets, setWallets] = useState<Wallet[]>([]);
	const [loading, setLoading] = useState(true);
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [currentWallet, setCurrentWallet] = useState<Wallet>();
	const supabase = createClient();

	const totalsByCurrency = wallets.reduce<Record<string, number>>((acc, wallet) => {
		const currency = wallet.currency || "USD";
		acc[currency] = (acc[currency] || 0) + wallet.balance;
		return acc;
	}, {});
	const totalByCurrencyEntries = Object.entries(totalsByCurrency);

	const handleDeleteWallet = async (id: string) => {
		try {
			await deleteWallet(supabase, id);
			toast.success("Wallet deleted successfully!");
			await fetchWallets();
		} catch (error) {
			if (error instanceof Error && error.message === "WALLET_HAS_TRANSACTIONS") {
				toast.error("Remove or reassign transactions before deleting this wallet.");
				return;
			}
			toast.error("An error occurred. Try again later");
		}
	};

	const handleEditClick = (wallet: Wallet) => {
		setCurrentWallet(wallet);
		setIsEditModalOpen(true);
	};

	const fetchWallets = async () => {
		try {
			const data = await listWalletsWithRecentActivity(supabase);
			setWallets(data);
			return true;
		} catch {
			toast.error("Unexpected error loading wallets");
			return false;
		} finally {
			setLoading(false);
		}
	};

	const handleUpdateWallet = async (updatedWallet: Wallet) => {
		try {
			const { id, recentActivity, ...rest } = updatedWallet;
			void recentActivity;
			await updateWallet(supabase, {
				id,
				name: rest.name,
				balance: rest.balance,
				currency: rest.currency,
				type: rest.type,
				icon: rest.icon,
				color: rest.color,
				include_in_total: rest.include_in_total,
				notes: rest.notes,
			});

			setIsEditModalOpen(false);
			const refreshSuccess = await fetchWallets();
			if (refreshSuccess) toast.success("Wallet updated successfully!");
		} catch (error) {
			if (error instanceof AuthRequiredError) {
				toast.error(error.message);
			} else {
				toast.error("An unexpected error occurred.");
			}
		}
	};

	const handleAddWallet = async (newWallet: Wallet) => {
		try {
			const { id: _id, recentActivity, ...walletData } = newWallet;
			void _id;
			void recentActivity;
			await createWallet(supabase, walletData);

			setIsAddModalOpen(false);
			const refreshSuccess = await fetchWallets();
			if (refreshSuccess) toast.success("Wallet added successfully!");
		} catch (error) {
			if (error instanceof AuthRequiredError) {
				toast.error(error.message);
			} else {
				toast.error("An unexpected error occurred.");
			}
		}
	};

	useEffect(() => {
		fetchWallets();
	}, []);

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Wallets & Accounts</h1>
					<p className="text-sm text-muted-foreground">Manage your financial accounts</p>
				</div>
				<Button onClick={() => setIsAddModalOpen(true)} size="sm" className="h-9 gap-2">
					<PlusIcon className="h-3.5 w-3.5" />
					Add Wallet
				</Button>
			</div>

			{/* Total Balance */}
			<Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
				<CardContent className="p-5">
					<div className="flex items-center gap-4">
						<div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
							<WalletIcon className="h-6 w-6 text-primary" />
						</div>
						<div>
							<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
								Total Balance
							</p>
							<div className="text-3xl font-bold tracking-tight text-primary">
								{loading ? (
									<Skeleton className="h-9 w-40" />
								) : (
									<div className="space-y-1">
										{totalByCurrencyEntries.length > 0 ? (
											totalByCurrencyEntries.map(([currency, amount]) => (
												<div key={currency}>{formatCurrency(amount, currency)}</div>
											))
										) : (
											<div>{formatCurrency(0)}</div>
										)}
									</div>
								)}
							</div>
							{!loading && (
								<p className="text-xs text-muted-foreground mt-0.5">
									Across {wallets.length} account{wallets.length !== 1 ? "s" : ""}
								</p>
							)}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Wallets Grid */}
			{loading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{[...Array(3)].map((_, i) => (
						<Card key={i}>
							<CardContent className="p-5 space-y-3">
								<Skeleton className="h-5 w-32" />
								<Skeleton className="h-8 w-24" />
								<Skeleton className="h-16 w-full" />
							</CardContent>
						</Card>
					))}
				</div>
			) : wallets.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-16">
						<div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
							<WalletIcon className="h-7 w-7 text-muted-foreground" />
						</div>
						<h3 className="text-base font-semibold mb-1">No wallets yet</h3>
						<p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
							Create your first wallet to start tracking your finances.
						</p>
						<Button onClick={() => setIsAddModalOpen(true)} size="sm" className="gap-2">
							<PlusIcon className="h-3.5 w-3.5" />
							Create Wallet
						</Button>
					</CardContent>
				</Card>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{wallets.map((wallet, idx) => (
						<Card
							key={wallet.id}
							className="overflow-hidden transition-all duration-200 hover:shadow-md animate-slide-up"
							style={{ animationDelay: `${idx * 80}ms`, animationFillMode: "both" }}
						>
							<CardHeader className="p-4 pb-2">
								<div className="flex justify-between items-start">
									<div className="flex items-center gap-2.5">
										<span className="text-xl">{wallet.icon}</span>
										<div>
											<CardTitle className="text-sm font-semibold">
												{wallet.name}
											</CardTitle>
											<Badge variant="outline" className="mt-0.5 text-[10px] font-normal">
												{wallet.type
													? wallet.type.charAt(0).toUpperCase() + wallet.type.slice(1)
													: "Account"}
											</Badge>
										</div>
									</div>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg">
												<MoreHorizontalIcon className="h-3.5 w-3.5" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem onClick={() => handleEditClick(wallet)}>
												<PencilIcon className="mr-2 h-3.5 w-3.5" />
												Edit
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => handleDeleteWallet(wallet.id)}
												className="text-destructive focus:text-destructive"
											>
												<TrashIcon className="mr-2 h-3.5 w-3.5" />
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</CardHeader>
							<CardContent className="p-4 pt-1">
								<p
									className={cn(
										"text-2xl font-bold tracking-tight",
										wallet.balance >= 0
											? "text-emerald-600 dark:text-emerald-400"
											: "text-rose-600 dark:text-rose-400"
									)}
								>
									{formatCurrency(wallet.balance, wallet.currency)}
								</p>
							</CardContent>
							{wallet.recentActivity.length > 0 && (
								<div className="px-4 py-3 border-t bg-muted/30">
									<p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
										Recent Activity
									</p>
									<div className="space-y-1.5">
										{wallet.recentActivity.slice(0, 3).map((activity) => (
											<div
												key={activity.id}
												className="flex justify-between items-center text-xs"
											>
												<span className="truncate max-w-[60%] text-muted-foreground">
													{activity.name}
												</span>
												<div className="flex items-center gap-1">
													{activity.type === "income" ? (
														<TrendingUpIcon className="h-2.5 w-2.5 text-emerald-500" />
													) : (
														<TrendingDownIcon className="h-2.5 w-2.5 text-rose-500" />
													)}
													<span
														className={cn(
															"font-medium tabular-nums",
															activity.type === "income"
																? "text-emerald-600 dark:text-emerald-400"
																: "text-rose-600 dark:text-rose-400"
														)}
													>
														{activity.type === "income" ? "+" : "-"}
														{formatCurrency(activity.amount, wallet.currency)}
													</span>
												</div>
											</div>
										))}
									</div>
								</div>
							)}
						</Card>
					))}
				</div>
			)}

			<AddWalletModal
				isOpen={isAddModalOpen}
				onClose={() => setIsAddModalOpen(false)}
				onAdd={handleAddWallet}
			/>

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
