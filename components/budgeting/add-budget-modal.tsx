"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
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
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { toast } from "sonner";
import type { NewBudgetInput } from "@/lib/data/budgets";
import { listCategoriesForUser } from "@/lib/data/transactions";
import { AuthRequiredError } from "@/lib/data/auth";

interface BudgetCategory {
	id: string;
	name: string;
	icon: string;
	color: string;
}

interface AddBudgetModalProps {
	isOpen: boolean;
	onClose: () => void;
	onAdd: (budget: NewBudgetInput) => void;
}

export function AddBudgetModal({
	isOpen,
	onClose,
	onAdd,
}: AddBudgetModalProps) {
	const [amount, setAmount] = useState("");
	const [categoryId, setCategoryId] = useState("");
	const [period, setPeriod] = useState("monthly");
	const [categories, setCategories] = useState<BudgetCategory[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const supabase = createClient();

	useEffect(() => {
		if (!isOpen) return;

		const fetchCategories = async () => {
			setLoading(true);
			setError(null);
			try {
				const data = await listCategoriesForUser(supabase);
				setCategories(
					data.map((category) => ({
						id: category.id,
						name: category.name,
						icon: category.icon,
						color: category.color,
					}))
				);
			} catch (err) {
				if (err instanceof AuthRequiredError) {
					toast.error(err.message);
				} else {
					console.error("Failed to fetch categories:", err);
					setError("Could not load categories.");
				}
			} finally {
				setLoading(false);
			}
		};

		void fetchCategories();
	}, [isOpen, supabase]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!amount || !categoryId) {
			toast.error("Please fill in all required fields");
			return;
		}

		const newBudget = {
			amount: parseFloat(amount),
			categoryId: categoryId,
			period,
		};

		onAdd(newBudget);

		setAmount("");
		setCategoryId("");
		setPeriod("monthly");
	};

	return (
		<ResponsiveDialog open={isOpen} onOpenChange={onClose}>
			<DialogHeader>
				<DialogTitle>Add Budget</DialogTitle>
				<DialogDescription>
					Create a new budget for a category.
				</DialogDescription>
			</DialogHeader>

			<form onSubmit={handleSubmit}>
				<div className="space-y-4 py-4">
					{/* Category Selection */}
					<div className="space-y-2">
						<Label htmlFor="category">Category</Label>
						<Select
							value={categoryId}
							onValueChange={setCategoryId}
							required
							disabled={loading || categories.length === 0}
						>
							<SelectTrigger id="category">
								<SelectValue
									placeholder={
										loading
											? "Loading..."
											: "Select category"
									}
								/>
							</SelectTrigger>
							<SelectContent>
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
						{error && (
							<p className="text-red-500 text-sm">{error}</p>
						)}
					</div>

					{/* Amount */}
					<div className="space-y-2">
						<Label htmlFor="amount">Budget Amount</Label>
						<div className="relative">
							<span className="absolute left-3 top-2.5 text-muted-foreground">
								$
							</span>
							<Input
								id="amount"
								type="number"
								min="0"
								step="0.01"
								className="pl-7"
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
								placeholder="0.00"
								required
							/>
						</div>
					</div>

					{/* Period */}
					<div className="space-y-2">
						<Label htmlFor="period">Budget Period</Label>
						<Select value={period} onValueChange={setPeriod}>
							<SelectTrigger id="period">
								<SelectValue placeholder="Select period" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="weekly">Weekly</SelectItem>
								<SelectItem value="monthly">Monthly</SelectItem>
								<SelectItem value="quarterly">
									Quarterly
								</SelectItem>
								<SelectItem value="yearly">Yearly</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				<DialogFooter className="mt-6">
					<Button type="button" variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button type="submit">Add Budget</Button>
				</DialogFooter>
			</form>
		</ResponsiveDialog>
	);
}
