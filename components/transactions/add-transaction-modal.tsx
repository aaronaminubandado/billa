// Add Transaction Modal
"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import type { Category, NewTransactionPayload, Wallet } from "@/lib/types";
import {
	listCategoriesForUser,
	listWalletsForUser,
} from "@/lib/data/transactions";
import { AuthRequiredError } from "@/lib/data/auth";

interface AddTransactionModalProps {
	isOpen: boolean;
	onClose: () => void;
	onAdd: (transaction: NewTransactionPayload) => void;
}

export function AddTransactionModal({
	isOpen,
	onClose,
	onAdd,
}: AddTransactionModalProps) {
	const [type, setType] = useState<"income" | "expense">("expense");
	const [name, setName] = useState("");
	const [amount, setAmount] = useState("");
	const [categoryId, setCategoryId] = useState("");
	const [walletId, setWalletId] = useState("");
	const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
	const [recurring, setRecurring] = useState(false);
	const [recurringFrequency, setRecurringFrequency] = useState("monthly");
	const [notes, setNotes] = useState("");
	const [wallets, setWallets] = useState<Wallet[]>([]);
	const [categories, setCategories] = useState<Category[]>([]);
	const supabase = createClient();

	const isMobile = useMediaQuery("(max-width: 768px)");

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			onClose();
		}
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [walletData, categoryData] = await Promise.all([
					listWalletsForUser(supabase),
					listCategoriesForUser(supabase),
				]);
				setWallets(walletData);
				setCategories(categoryData);
			} catch (err) {
				if (err instanceof AuthRequiredError) {
					console.error("Error fetching user:", err.message);
					return;
				}
				const message = err instanceof Error ? err.message : "Unknown error";
				console.error("Error fetching data:", message);
			}
		};

		if (isOpen) fetchData();
	}, [isOpen, supabase]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!name.trim() || !amount || !categoryId || !walletId) {
			toast.error("Please fill in all required fields");
			return;
		}

		const newTransaction = {
			type,
			name,
			amount: Number.parseFloat(amount),
			category_id: categoryId,
			wallet_id: walletId,
			date,
			recurring,
			recurring_frequency: recurring ? recurringFrequency : null,
			notes,
		};

		onAdd(newTransaction);

		// Reset form
		setType("expense");
		setName("");
		setAmount("");
		setCategoryId("");
		setWalletId("");
		setDate(new Date().toISOString().split("T")[0]);
		setRecurring(false);
		setRecurringFrequency("monthly");
		setNotes("");

		onClose();
	};

	// Reset form when modal closes
	useEffect(() => {
		if (!isOpen) {
			setType("expense");
			setName("");
			setAmount("");
			setCategoryId("");
			setWalletId("");
			setDate(new Date().toISOString().split("T")[0]);
			setRecurring(false);
			setRecurringFrequency("monthly");
			setNotes("");
		}
	}, [isOpen]);

	// Filter categories based on explicit type field
	const filteredCategories = categories.filter(
		(category) => category.type === type
	);

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogContent
				className={cn(
					// FIXED: Better responsive sizing
					"max-w-md w-full mx-4", // Smaller max width, responsive margins
					isMobile
						? "h-[90vh] max-h-[90vh] overflow-y-auto" // Mobile: 90% height with scroll
						: "max-h-[85vh] overflow-y-auto" // Desktop: max 85% height with scroll
				)}
				onInteractOutside={(e) => {
					const target = e.target as Element;
					if (target?.closest("[data-radix-select-content]")) {
						e.preventDefault();
					}
				}}
			>
				<DialogHeader className="space-y-2">
					<DialogTitle>Add Transaction</DialogTitle>
					<DialogDescription>
						Record a new income or expense transaction
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Transaction Type Toggle */}
					<div className="flex space-x-2">
						<Button
							type="button"
							variant={type === "expense" ? "default" : "outline"}
							onClick={() => setType("expense")}
							className="flex-1"
							size="sm"
						>
							Expense
						</Button>
						<Button
							type="button"
							variant={type === "income" ? "default" : "outline"}
							onClick={() => setType("income")}
							className="flex-1"
							size="sm"
						>
							Income
						</Button>
					</div>

					<div className="grid grid-cols-1 gap-4">
						<div className="space-y-2">
							<Label htmlFor="name">Description</Label>
							<Input
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="e.g., Grocery shopping, Salary"
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="amount">Amount</Label>
							<Input
								id="amount"
								type="number"
								step="0.01"
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
								placeholder="0.00"
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="category">Category</Label>
							<Select
								key={`category-${isOpen}-${type}`}
								value={categoryId}
								onValueChange={setCategoryId}
							>
								<SelectTrigger id="category">
									<SelectValue placeholder="Select category" />
								</SelectTrigger>
								<SelectContent position="popper" sideOffset={4}>
									{filteredCategories.map((category) => (
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
						</div>

						<div className="space-y-2">
							<Label htmlFor="wallet">Wallet</Label>
							<Select
								key={`wallet-${isOpen}`}
								value={walletId}
								onValueChange={setWalletId}
							>
								<SelectTrigger id="wallet">
									<SelectValue placeholder="Select wallet" />
								</SelectTrigger>
								<SelectContent position="popper" sideOffset={4}>
									{wallets.map((wallet) => (
										<SelectItem
											key={wallet.id}
											value={wallet.id.toString()}
										>
											<div className="flex items-center">
												<span className="mr-2">
													{wallet.icon}
												</span>
												<span>{wallet.name}</span>
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="date">Date</Label>
							<Input
								id="date"
								type="date"
								value={date}
								onChange={(e) => setDate(e.target.value)}
								required
							/>
						</div>

						<div className="flex items-center justify-between space-x-2">
							<Label
								htmlFor="recurring"
								className="text-sm font-medium"
							>
								Recurring Transaction
							</Label>
							<Switch
								id="recurring"
								checked={recurring}
								onCheckedChange={setRecurring}
							/>
						</div>

						{recurring && (
							<div className="space-y-2">
								<Label htmlFor="frequency">Frequency</Label>
								<Select
									value={recurringFrequency}
									onValueChange={setRecurringFrequency}
								>
									<SelectTrigger id="frequency">
										<SelectValue />
									</SelectTrigger>
									<SelectContent
										position="popper"
										sideOffset={4}
									>
										<SelectItem value="daily">
											Daily
										</SelectItem>
										<SelectItem value="weekly">
											Weekly
										</SelectItem>
										<SelectItem value="monthly">
											Monthly
										</SelectItem>
										<SelectItem value="yearly">
											Yearly
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						)}

						<div className="space-y-2">
							<Label htmlFor="notes">Notes (Optional)</Label>
							<Textarea
								id="notes"
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								placeholder="Additional notes..."
								rows={2}
							/>
						</div>
					</div>

					<DialogFooter className="flex-col sm:flex-row gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							className="w-full sm:w-auto"
						>
							Cancel
						</Button>
						<Button type="submit" className="w-full sm:w-auto">
							Add Transaction
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
