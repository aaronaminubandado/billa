"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EditIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface BudgetCategoryGroupProps {
	category: {
		id: number;
		name: string;
		icon: string;
		color: string;
	};
	budgets: Array<{
		id: number;
		name: string;
		amount: number;
		used: number;
		period: string;
	}>;
	onEditBudget: (budget: any) => void;
}

export function BudgetCategoryGroup({
	category,
	budgets,
	onEditBudget,
}: BudgetCategoryGroupProps) {
	// Calculate total budget and used for the category
	const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0);
	const totalUsed = budgets.reduce((sum, b) => sum + b.used, 0);

	// Calculate percentage used
	const percentageUsed =
		totalBudgeted > 0 ? (totalUsed / totalBudgeted) * 100 : 0;


	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center">
						<div
							className="w-8 h-8 rounded-full mr-2 flex items-center justify-center text-lg"
							style={{
								backgroundColor: category.color,
								color: "white",
							}}
						>
							{category.icon}
						</div>
						<span>{category.name}</span>
					</div>
					{budgets[0] && (
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6"
							onClick={() => onEditBudget(budgets[0])} // Edit first budget in category
						>
							<EditIcon className="h-3.5 w-3.5" />
							<span className="sr-only">
								Edit {category.name}
							</span>
						</Button>
					)}
				</CardTitle>
			</CardHeader>

			<CardContent className="space-y-2">
				<div className="flex justify-between text-sm font-medium">
					<span>Total Spent</span>
					<span>
						${totalUsed.toLocaleString()} / $
						{totalBudgeted.toLocaleString()} (
						{Math.round(percentageUsed)}%)
					</span>
				</div>
				<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-full overflow-hidden">
					<div
						className={`h-full rounded-full transition-all ${
							percentageUsed > 100
								? "bg-red-600"
								: percentageUsed > 90
								? "bg-yellow-500"
								: "bg-green-600"
						}`}
						style={{ width: `${Math.min(100, percentageUsed)}%` }}
					/>
				</div>
			</CardContent>
		</Card>
	);
}
