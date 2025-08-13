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

// Interfaces
interface Budget {
	id: number;
	name: string;
	amount: number;
	used: number;
	period: string;
}

interface BudgetCategory {
	id: number;
	name: string;
	icon: string;
	color: string;
}

interface BudgetData {
	category: BudgetCategory;
	budgets: Budget[];
}

// New interfaces for input types
interface NewBudgetInput {
	categoryId: string;
	name: string;
	amount: number;
	period: string;
}

interface EditBudgetInput {
	id: number;
	name: string;
	amount: number;
	period: string;
}

interface BudgetWithCategory extends Budget {
	category: BudgetCategory;
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
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser();

		if (userError || !user) {
			toast.error("Failed to load user.");
			return;
		}

		const { data: budgets, error } = await supabase
			.from("budgets")
			.select("*, category:categories(*)")
			.eq("user_id", user.id)
			.order("created_at", { ascending: false });

		if (error) {
			toast.error("Failed to fetch budgets.");
			console.error(error);
			return;
		}

		// Group budgets by category
		const grouped = budgets.reduce((acc: BudgetData[], budget) => {
			const cat = budget.category;
			let group = acc.find((g) => g.category.id === cat.id);

			const budgetItem: Budget = {
				id: budget.id,
				name: budget.name,
				amount: parseFloat(budget.amount),
				used: 0,
				period: budget.period,
			};

			if (group) {
				group.budgets.push(budgetItem);
			} else {
				acc.push({
					category: {
						id: cat.id,
						name: cat.name,
						icon: cat.icon,
						color: cat.color,
					},
					budgets: [budgetItem],
				});
			}
			return acc;
		}, []);

		setBudgetData(grouped);
	};


	useEffect(() => {
		fetchBudgets();
	}, []);



	// Add budget and refresh
	const handleAddBudget = async (newBudget: NewBudgetInput) => {
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser();

		if (userError || !user) {
			toast.error("User not authenticated.");
			return;
		}

		const { error } = await supabase.from("budgets").insert([
			{
				user_id: user.id,
				name: newBudget.name,
				amount: newBudget.amount,
				category_id: newBudget.categoryId,
				period: newBudget.period,
				start_date: new Date(),
			},
		]);

		if (error) {
			toast.error("Failed to add budget.");
			console.error(error);
			return;
		}

		setIsAddModalOpen(false);
		await fetchBudgets(); 
	};

	// Handle editing a budget (Implement)
	const handleEditBudget = (updatedBudget: EditBudgetInput) => {
		// In a real app, this would make an API call
		console.log("Updating budget:", updatedBudget);

		const updatedData = budgetData.map((group) => {
			const updatedBudgets = group.budgets.map((budget) =>
				budget.id === updatedBudget.id
					? { ...budget, ...updatedBudget }
					: budget
			);

			return {
				...group,
				budgets: updatedBudgets,
			};
		});

		setBudgetData(updatedData);
		setIsEditModalOpen(false);
	};

	// Handle deleting a budget
	const handleDeleteBudget = (budgetId: number) => {
		// In a real app, this would make an API call
		console.log("Deleting budget:", budgetId);

		const updatedData = budgetData
			.map((group) => ({
				...group,
				budgets: group.budgets.filter(
					(budget) => budget.id !== budgetId
				),
			}))
			.filter((group) => group.budgets.length > 0);

		setBudgetData(updatedData);
		setIsEditModalOpen(false);
	};

	// Open edit modal with selected budget
	const openEditModal = (budget: Budget, category: BudgetCategory) => {
		setCurrentBudget({ ...budget, category });
		setIsEditModalOpen(true);
	};

	// Filter budgets based on search query
	const filteredBudgetData =
		searchQuery.trim() === ""
			? budgetData
			: budgetData
					.map((group) => ({
						...group,
						budgets: group.budgets.filter((budget) =>
							budget.name
								.toLowerCase()
								.includes(searchQuery.toLowerCase())
						),
					}))
					.filter((group) => group.budgets.length > 0);

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
										{Math.round(
											(totalUsed / totalBudgeted) * 100
										)}
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
			<div className="flex items-center space-x-2">
				<div className="relative flex-1">
					<SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search budgets..."
						className="pl-8"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
				<Button variant="outline" size="icon">
					<FilterIcon className="h-4 w-4" />
					<span className="sr-only">Filter</span>
				</Button>
			</div>

			{/* Budget categories section */}
			<div className="space-y-6">
				<Tabs defaultValue="all" className="w-full">
					<TabsList className="mb-4">
						<TabsTrigger value="all">All Budgets</TabsTrigger>
						<TabsTrigger value="ontrack">On Track</TabsTrigger>
						<TabsTrigger value="warning">Warning</TabsTrigger>
						<TabsTrigger value="over">Over Budget</TabsTrigger>
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
