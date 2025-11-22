// Transactions List component
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EditIcon, TrashIcon, MoreHorizontalIcon, BanIcon } from "lucide-react"; // <-- Added BanIcon
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
import { CreditCardIcon } from "lucide-react";

interface TransactionsListProps {
	transactions: any[];
	onEdit: (transaction: any) => void;
	onCancel: (transactionId: string) => void; // <-- renamed from onDelete
}

export function TransactionsList({
	transactions,
	onEdit,
	onCancel,
}: TransactionsListProps) {
	const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
	const [transactionToCancel, setTransactionToCancel] = useState<any>(null);

	const handleCancelClick = (transaction: any) => {
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

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	if (transactions.length === 0) {
		return (
			<Card>
				<CardContent className="flex flex-col items-center justify-center py-12">
					<div className="text-muted-foreground text-center">
						<CreditCardIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
						<h3 className="text-lg font-medium mb-2">
							No transactions found
						</h3>
						<p>
							Try adjusting your filters or add your first
							transaction.
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-4">
			<Card>
				<CardHeader>
					<CardTitle>
						Recent Transactions ({transactions.length})
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{transactions.map((transaction) => {
							const isCanceled =
								transaction.status === "canceled";

							return (
								<div
									key={transaction.id}
									className={`flex items-center justify-between p-4 border rounded-lg transition-colors
                    ${
						isCanceled
							? "opacity-50 bg-red-50 dark:bg-red-900/20"
							: "hover:bg-muted/50"
					}  
                  `}
								>
									<div className="flex items-center space-x-4">
										{/* Category Icon */}
										<div
											className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg"
											style={{
												backgroundColor:
													transaction.category.color,
											}}
										>
											{transaction.category.icon}
										</div>

										{/* Details */}
										<div className="flex-1">
											<div className="flex items-center gap-2">
												<h4 className="font-medium">
													{transaction.name}
												</h4>

												{/* Recurring Badge */}
												{transaction.recurring && (
													<Badge
														variant="secondary"
														className="text-xs"
													>
														Recurring
													</Badge>
												)}

												{/* NEW — Canceled Badge */}
												{isCanceled && (
													<Badge
														variant="destructive"
														className="text-xs"
													>
														Canceled
													</Badge>
												)}
											</div>

											<div className="flex items-center gap-4 text-sm text-muted-foreground">
												<span>
													{transaction.category.name}
												</span>
												<span>•</span>
												<span>
													{transaction.wallet.name}
												</span>
												<span>•</span>
												<span>
													{formatDate(
														transaction.date
													)}
												</span>
											</div>

											{transaction.notes && (
												<p className="text-sm text-muted-foreground mt-1">
													{transaction.notes}
												</p>
											)}
										</div>
									</div>

									{/* Amount + Actions */}
									<div className="flex items-center space-x-4">
										<div className="text-right">
											<div
												className={`font-semibold ${
													transaction.type ===
													"income"
														? "text-green-600"
														: "text-red-600"
												}`}
											>
												{transaction.type === "income"
													? "+"
													: "-"}
												$
												{transaction.amount.toLocaleString()}
											</div>
											<div className="text-xs text-muted-foreground">
												{transaction.type === "income"
													? "Income"
													: "Expense"}
											</div>
										</div>

										{/* Action Menu */}
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													size="icon"
												>
													<MoreHorizontalIcon className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>

											<DropdownMenuContent align="end">
												{/* Disable editing if canceled */}
												<DropdownMenuItem
													disabled={isCanceled}
													onClick={() =>
														!isCanceled &&
														onEdit(transaction)
													}
												>
													<EditIcon className="h-4 w-4 mr-2" />
													Edit
												</DropdownMenuItem>

												{/* Cancel Transaction */}
												{!isCanceled && (
													<DropdownMenuItem
														onClick={() =>
															handleCancelClick(
																transaction
															)
														}
														className="text-red-600"
													>
														<BanIcon className="h-4 w-4 mr-2" />
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

			{/* Cancel Confirmation */}
			<AlertDialog
				open={cancelDialogOpen}
				onOpenChange={setCancelDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Cancel Transaction</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to cancel "
							{transactionToCancel?.name}"? Canceling will revert
							the wallet balance and cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>

					<AlertDialogFooter>
						<AlertDialogCancel>Close</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleCancelConfirm}
							className="bg-red-600 hover:bg-red-700"
						>
							Cancel Transaction
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
