// Edit Transaction Modal"use client";

import type React from "react";
import { useState, useEffect } from "react";
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

interface EditTransactionModalProps {
	isOpen: boolean;
	onClose: () => void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	transaction: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onUpdate: (transaction: any) => void;
}

export function EditTransactionModal({
	isOpen,
	onClose,
	transaction,
	onUpdate,
}: EditTransactionModalProps) {
	const [type, setType] = useState<"income" | "expense">("expense");
	const [name, setName] = useState("");
	const [amount, setAmount] = useState("");
	const [categoryId, setCategoryId] = useState("");
	const [walletId, setWalletId] = useState("");
	const [date, setDate] = useState("");
	const [recurring, setRecurring] = useState(false);
	const [recurringFrequency, setRecurringFrequency] = useState("monthly");
	const [notes, setNotes] = useState("");
	const [wallets, setWallets] = useState<any[]>([]);
	const [categories, setCategories] = useState<any[]>([]);
	const supabase = createClient();

	const isMobile = useMediaQuery("(max-width: 768px)");

	// Populate form with transaction data
	useEffect(() => {
		if (transaction && isOpen) {
			setType(transaction.type || "expense");
			setName(transaction.name || "");
			setAmount(transaction.amount?.toString() || "");
			setCategoryId(transaction.categoryId?.toString() || "");
			setWalletId(transaction.walletId?.toString() || "");
			setDate(transaction.date || new Date().toISOString().split("T")[0]);
			setRecurring(transaction.recurring || false);
			setRecurringFrequency(transaction.recurringFrequency || "monthly");
			setNotes(transaction.notes || "");
		}
	}, [transaction, isOpen]);

	useEffect(() => {
		const fetchData = async () => {
			const {
				data: { user },
				error: userError,
			} = await supabase.auth.getUser();

			if (userError || !user) {
				console.error("Error fetching user:", userError?.message);
				return;
			}

			try {
				// Fetch user wallets
				const { data: walletData, error: walletError } = await supabase
					.from("wallets")
					.select("*")
					.eq("user_id", user.id);

				if (walletError) throw walletError;
				setWallets(walletData || []);

				// Fetch user categories
				const { data: categoryData, error: categoryError } =
					await supabase
						.from("categories")
						.select("*")
						.eq("user_id", user.id);

				if (categoryError) throw categoryError;
				setCategories(categoryData || []);
			} catch (err: any) {
				console.error("Error fetching data:", err.message);
			}
		};

		if (isOpen) fetchData();
	}, [isOpen]);

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			onClose();
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!name.trim() || !amount || !categoryId || !walletId) {
			alert("Please fill in all required fields");
			return;
		}

		const updatedTransaction = {
			...transaction,
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

		onUpdate(updatedTransaction);
		onClose();
	};

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
					<DialogTitle>Edit Transaction</DialogTitle>
					<DialogDescription>
						Update your transaction details
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
							Update Transaction
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
