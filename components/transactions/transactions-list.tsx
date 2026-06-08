"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EditIcon, MoreHorizontalIcon, BanIcon, InboxIcon } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/lib/types";

interface TransactionsListProps {
	transactions: Transaction[];
	onEdit: (transaction: Transaction) => void;
	onCancel: (transactionId: string) => void;
}

const toTranslucentBackground = (color?: string) => {
	if (!color) return "hsl(var(--muted))";
	const trimmed = color.trim();
	const hex = trimmed.replace(/^#/, "");

	if (/^[0-9A-Fa-f]{6}$/.test(hex)) {
		const r = Number.parseInt(hex.slice(0, 2), 16);
		const g = Number.parseInt(hex.slice(2, 4), 16);
		const b = Number.parseInt(hex.slice(4, 6), 16);
		return `rgba(${r}, ${g}, ${b}, 0.12)`;
	}

	if (/^[0-9A-Fa-f]{3}$/.test(hex)) {
		const expandedHex = hex
			.split("")
			.map((char) => `${char}${char}`)
			.join("");
		const r = Number.parseInt(expandedHex.slice(0, 2), 16);
		const g = Number.parseInt(expandedHex.slice(2, 4), 16);
		const b = Number.parseInt(expandedHex.slice(4, 6), 16);
		return `rgba(${r}, ${g}, ${b}, 0.12)`;
	}

	if (
		/^rgba?\(/i.test(trimmed) ||
		/^hsla?\(/i.test(trimmed) ||
		trimmed.startsWith("var(") ||
		/^[a-zA-Z]+$/.test(trimmed)
	) {
		return `color-mix(in srgb, ${trimmed} 20%, transparent)`;
	}

	return "hsl(var(--muted))";
};

export function TransactionsList({
	transactions,
	onEdit,
	onCancel,
}: TransactionsListProps) {
	const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
	const [transactionToCancel, setTransactionToCancel] =
		useState<Transaction | null>(null);

	const handleCancelClick = (transaction: Transaction) => {
		setTransactionToCancel(transaction);
		setCancelDialogOpen(true);
	};

	const handleCancelConfirm = () => {
		if (transactionToCancel) {
			onCancel(transactionToCancel.id);
			setCancelDialogOpen(false);
			setTransactionToCancel(null);
		}
	};

	if (transactions.length === 0) {
		return (
			<Card>
				<CardContent className="flex flex-col items-center justify-center py-16">
					<div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
						<InboxIcon className="h-7 w-7 text-muted-foreground" />
					</div>
					<h3 className="text-base font-semibold mb-1">
						No transactions found
					</h3>
					<p className="text-sm text-muted-foreground text-center max-w-sm">
						Try adjusting your filters or add your first transaction to get started.
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-3">
			<Card>
				<CardHeader className="py-4 px-5">
					<div className="flex items-center justify-between">
						<CardTitle className="text-base font-semibold">
							Transactions
						</CardTitle>
						<Badge variant="secondary" className="text-xs font-medium">
							{transactions.length} total
						</Badge>
					</div>
				</CardHeader>
				<CardContent className="px-5 pb-5">
					<div className="space-y-2">
						{transactions.map((transaction, idx) => {
							const isCanceled = transaction.status === "canceled";

							return (
								<div
									key={transaction.id}
									className={cn(
										"flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 animate-slide-up",
										isCanceled
											? "opacity-50 bg-destructive/5 border-destructive/20"
											: "hover:bg-accent/50 hover:shadow-sm"
									)}
									style={{ animationDelay: `${Math.min(idx * 30, 300)}ms`, animationFillMode: "both" }}
								>
									<div className="flex items-center gap-3 min-w-0 flex-1">
										<div
											className="w-9 h-9 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
											style={{
												backgroundColor: toTranslucentBackground(transaction.category?.color),
												color: transaction.category?.color || "hsl(var(--muted-foreground))",
											}}
										>
											{transaction.category?.icon || "💰"}
										</div>

										<div className="min-w-0 flex-1">
											<div className="flex items-center gap-1.5">
												<h4 className="text-sm font-medium truncate">
													{transaction.name}
												</h4>
												{transaction.recurring && (
													<Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal">
														Recurring
													</Badge>
												)}
												{isCanceled && (
													<Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">
														Canceled
													</Badge>
												)}
											</div>
											<div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
												<span>{transaction.category?.name || "Uncategorized"}</span>
												<span className="text-muted-foreground/40">·</span>
												<span>{transaction.wallet?.name || "No wallet"}</span>
												<span className="text-muted-foreground/40">·</span>
												<span>{formatDate(transaction.date)}</span>
											</div>
										</div>
									</div>

									<div className="flex items-center gap-2 flex-shrink-0 ml-3">
										<div className="text-right">
											<div
												className={cn(
													"text-sm font-semibold tabular-nums",
													transaction.type === "income"
														? "text-emerald-600 dark:text-emerald-400"
														: "text-rose-600 dark:text-rose-400"
												)}
											>
												{transaction.type === "income" ? "+" : "-"}
												{formatCurrency(transaction.amount)}
											</div>
										</div>

										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg">
													<MoreHorizontalIcon className="h-3.5 w-3.5" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem
													disabled={isCanceled}
													onClick={() => !isCanceled && onEdit(transaction)}
												>
													<EditIcon className="h-3.5 w-3.5 mr-2" />
													Edit
												</DropdownMenuItem>
												{!isCanceled && (
													<DropdownMenuItem
														onClick={() => handleCancelClick(transaction)}
														className="text-destructive focus:text-destructive"
													>
														<BanIcon className="h-3.5 w-3.5 mr-2" />
														Cancel
													</DropdownMenuItem>
												)}
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</div>
							);
						})}
					</div>
				</CardContent>
			</Card>

			<AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Cancel Transaction</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to cancel &ldquo;{transactionToCancel?.name}&rdquo;?
							This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Close</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleCancelConfirm}
							className="bg-destructive hover:bg-destructive/90"
						>
							Cancel Transaction
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
