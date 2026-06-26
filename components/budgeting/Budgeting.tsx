"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { PlusIcon, SearchIcon, FilterIcon } from "lucide-react";
import { AddBudgetModal } from "@/components/budgeting/add-budget-modal";
import { EditBudgetModal } from "@/components/budgeting/edit-budget-modal";
import { BudgetCategoryGroup } from "@/components/budgeting/budget-category-group";
import { BudgetSummaryChart } from "@/components/budgeting/budget-summary-chart";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import {
	createBudget,
	deleteBudget,
	listBudgetsGroupedByCategory,
	updateBudget,
	type BudgetData,
	type EditBudgetInput,
	type NewBudgetInput,
} from "@/lib/data/budgets";
import type { BudgetListItem } from "@/lib/types";
import { AuthRequiredError } from "@/lib/data/auth";

type Budget = BudgetListItem;

interface BudgetWithCategory extends BudgetListItem {
	category: BudgetData["category"];
}

export default function BudgetPage() {
	// State for modals
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [currentBudget, setCurrentBudget] =
		useState<BudgetWithCategory | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [budgetData, setBudgetData] = useState<BudgetData[]>([]);
	const supabase = createClient();

	//Fetch budgets function
	const fetchBudgets = async () => {
		try {
			const grouped = await listBudgetsGroupedByCategory(supabase);
			setBudgetData(grouped);
		} catch (error) {
			if (error instanceof AuthRequiredError) {
				toast.error(error.message);
			} else {
				toast.error("Failed to fetch budgets.");
				console.error(error);
			}
		}
	};

	useEffect(() => {
		fetchBudgets();
	}, []);

	// Add budget and refresh
	const handleAddBudget = async (newBudget: NewBudgetInput) => {
		try {
			await createBudget(supabase, newBudget);
			toast.success("Budget added successfully!");
			setIsAddModalOpen(false);
			await fetchBudgets();
		} catch (error) {
			if (error instanceof AuthRequiredError) {
				toast.error(error.message);
			} else {
				toast.error("Failed to add budget.");
				console.error(error);
			}
		}
	};

	const handleEditBudget = async (updatedBudget: EditBudgetInput) => {
		try {
			await updateBudget(supabase, updatedBudget);
			toast.success("Budget edited successfully!");
			setIsEditModalOpen(false);
			await fetchBudgets();
		} catch (error) {
			if (error instanceof AuthRequiredError) {
				toast.error(error.message);
			} else {
				toast.error("Failed to update budget.");
				console.error(error);
			}
		}
	};

	const handleDeleteBudget = async (budgetId: string) => {
		try {
			await deleteBudget(supabase, budgetId);
			toast.success("Budget deleted successfully!");
			setIsEditModalOpen(false);
			await fetchBudgets();
		} catch (error) {
			if (error instanceof AuthRequiredError) {
				toast.error(error.message);
			} else {
				toast.error("Failed to delete budget.");
				console.error(error);
			}
		}
	};

	// Open edit modal with selected budget
	const openEditModal = (
		budget: Budget,
		category: BudgetData["category"]
	) => {
		setCurrentBudget({ ...budget, category });
		setIsEditModalOpen(true);
	};

	// Filter budget categories based on search query
	const filteredBudgetData = budgetData.filter((group) =>
		group.category.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	// Calculate total budgeted and used amounts
	const totalBudgeted = budgetData.reduce(
		(total, group) =>
			total +
			group.budgets.reduce((sum, budget) => sum + budget.amount, 0),
		0
	);

	const totalUsed = budgetData.reduce(
		(total, group) =>
			total + group.budgets.reduce((sum, budget) => sum + budget.used, 0),
		0
	);

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<Button onClick={() => setIsAddModalOpen(true)}>
					<PlusIcon className="h-4 w-4 mr-2" />
					Add Budget
				</Button>
			</div>

			{/* Budget summary section */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<Card className="col-span-1 md:col-span-2">
					<CardHeader>
						<CardTitle>Budget Summary</CardTitle>
						<CardDescription>
							Overview of your budget allocation and usage
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="h-[300px]">
							<BudgetSummaryChart budgetData={budgetData} />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Budget Status</CardTitle>
						<CardDescription>
							Your overall budget progress
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-6">
							<div className="space-y-2">
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">
										Total Budgeted
									</span>
									<span className="font-medium">
										${totalBudgeted.toLocaleString()}
									</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">
										Total Used
									</span>
									<span className="font-medium">
										${totalUsed.toLocaleString()}
									</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">
										Remaining
									</span>
									<span
										className={`font-medium ${
											totalBudgeted - totalUsed >= 0
												? "text-green-600 dark:text-green-400"
												: "text-red-600 dark:text-red-400"
										}`}
									>
										$
										{(
											totalBudgeted - totalUsed
										).toLocaleString()}
									</span>
								</div>
							</div>

							<div className="space-y-2">
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">
										Overall Progress
									</span>
									<span className="font-medium">
										{totalBudgeted > 0
											? Math.round((totalUsed / totalBudgeted) * 100)
											: 0}
										%
									</span>
								</div>
								<div className="h-2 bg-muted rounded-full overflow-hidden">
									<div
										className={`h-full ${
											totalUsed / totalBudgeted > 1
												? "bg-red-600"
												: totalUsed / totalBudgeted >
												  0.9
												? "bg-yellow-500"
												: "bg-green-600"
										}`}
										style={{
											width: `${Math.min(
												100,
												(totalUsed / totalBudgeted) *
													100
											)}%`,
										}}
									/>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Search and filter section */}
			<div className="flex flex-col sm:flex-row gap-2 sm:gap-2 sm:items-center min-w-0">
				<div className="relative flex-1 w-full min-w-0">
					<SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search budgets..."
						className="pl-8 w-full min-w-0"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
				<Button variant="outline" size="icon" className="shrink-0">
					<FilterIcon className="h-4 w-4" />
					<span className="sr-only">Filter</span>
				</Button>
			</div>

			{/* Budget categories section */}
			<div className="space-y-6">
				<Tabs defaultValue="all" className="w-full min-w-0">
					<TabsList className="mb-4 flex flex-wrap sm:flex-nowrap gap-1 h-auto p-1 w-full overflow-x-auto">
						<TabsTrigger value="all" className="flex-1 sm:flex-initial shrink-0">All Budgets</TabsTrigger>
						<TabsTrigger value="ontrack" className="flex-1 sm:flex-initial shrink-0">On Track</TabsTrigger>
						<TabsTrigger value="warning" className="flex-1 sm:flex-initial shrink-0">Warning</TabsTrigger>
						<TabsTrigger value="over" className="flex-1 sm:flex-initial shrink-0">Over Budget</TabsTrigger>
					</TabsList>

					<TabsContent value="all" className="space-y-6">
						{filteredBudgetData.length > 0 ? (
							filteredBudgetData.map((group) => (
								<BudgetCategoryGroup
									key={group.category.id}
									category={group.category}
									budgets={group.budgets}
									onEditBudget={(budget) =>
										openEditModal(budget, group.category)
									}
								/>
							))
						) : (
							<div className="text-center py-10">
								<p className="text-muted-foreground">
									No budgets found
								</p>
							</div>
						)}
					</TabsContent>

					<TabsContent value="ontrack" className="space-y-6">
						{filteredBudgetData
							.map((group) => {
								const onTrackBudgets = group.budgets.filter(
									(budget) =>
										budget.used / budget.amount <= 0.9
								);

								if (onTrackBudgets.length === 0) return null;

								return (
									<BudgetCategoryGroup
										key={group.category.id}
										category={group.category}
										budgets={onTrackBudgets}
										onEditBudget={(budget) =>
											openEditModal(
												budget,
												group.category
											)
										}
									/>
								);
							})
							.filter(Boolean)}
					</TabsContent>

					<TabsContent value="warning" className="space-y-6">
						{filteredBudgetData
							.map((group) => {
								const warningBudgets = group.budgets.filter(
									(budget) =>
										budget.used / budget.amount > 0.9 &&
										budget.used / budget.amount <= 1
								);

								if (warningBudgets.length === 0) return null;

								return (
									<BudgetCategoryGroup
										key={group.category.id}
										category={group.category}
										budgets={warningBudgets}
										onEditBudget={(budget) =>
											openEditModal(
												budget,
												group.category
											)
										}
									/>
								);
							})
							.filter(Boolean)}
					</TabsContent>

					<TabsContent value="over" className="space-y-6">
						{filteredBudgetData
							.map((group) => {
								const overBudgets = group.budgets.filter(
									(budget) => budget.used / budget.amount > 1
								);

								if (overBudgets.length === 0) return null;

								return (
									<BudgetCategoryGroup
										key={group.category.id}
										category={group.category}
										budgets={overBudgets}
										onEditBudget={(budget) =>
											openEditModal(
												budget,
												group.category
											)
										}
									/>
								);
							})
							.filter(Boolean)}
					</TabsContent>
				</Tabs>
			</div>

			{/* Modals */}
			<AddBudgetModal
				isOpen={isAddModalOpen}
				onClose={() => setIsAddModalOpen(false)}
				onAdd={handleAddBudget}
			/>

			{currentBudget && (
				<EditBudgetModal
					isOpen={isEditModalOpen}
					onClose={() => setIsEditModalOpen(false)}
					budget={currentBudget}
					onUpdate={handleEditBudget}
					onDelete={handleDeleteBudget}
					categories={budgetData.map((group) => group.category)}
				/>
			)}
		</div>
	);
}
