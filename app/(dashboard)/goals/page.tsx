"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
	PlusIcon,
	MoreHorizontalIcon,
	PencilIcon,
	TrashIcon,
	CalendarIcon,
	TargetIcon,
	TrophyIcon,
	AlertTriangleIcon,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddGoalModal } from "@/components/goals/add-goal-modal";
import { EditGoalModal } from "@/components/goals/edit-goal-modal";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { formatCurrency, getDaysRemaining } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface Goal {
	id: number;
	name: string;
	target_amount: number;
	current_amount: number;
	due_date: string;
	type: "savings" | "debt";
	wallet_id: number | null;
	icon: string;
	color: string;
}

interface GoalInput {
	name: string;
	type: "savings" | "debt";
	targetAmount: number;
	currentAmount: number;
	dueDate: string;
	icon: string;
	color: string;
	wallet_id?: number | null;
}

type GoalUpdateInput = Goal & {
	targetAmount?: number;
	currentAmount?: number;
	dueDate?: string;
};

export default function GoalsPage() {
	const supabase = createClient();
	const [goals, setGoals] = useState<Goal[]>([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("all");
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [currentGoal, setCurrentGoal] = useState<Goal | null>(null);

	const getWalletBalance = async (walletId: number) => {
		const { data, error } = await supabase
			.from("transactions")
			.select("amount")
			.eq("wallet_id", walletId);

		if (error) {
			console.error("Failed to fetch wallet balance:", error);
			throw error;
		}
		return data.reduce((s, t) => s + Number(t.amount), 0);
	};

	const fetchGoals = async () => {
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) {
				toast.error("You must be logged in.");
				return;
			}

			const { data, error } = await supabase
				.from("goals")
				.select("*")
				.eq("user_id", user.id)
				.order("created_at", { ascending: false });

			if (error) {
				toast.error("Failed to fetch goals.");
				return;
			}

			const updated = await Promise.all(
				data.map(async (goal) => {
					if (goal.type === "savings" && goal.wallet_id) {
						const balance = await getWalletBalance(goal.wallet_id);
						return { ...goal, current_amount: balance };
					}
					return goal;
				})
			);

			setGoals(updated);
		} catch {
			toast.error("Failed to load goals.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchGoals();
	}, []);

	const handleAddGoal = async (goalInput: GoalInput) => {
		if (
			!goalInput ||
			typeof goalInput.name !== "string" ||
			!goalInput.name.trim() ||
			!Number.isFinite(goalInput.targetAmount) ||
			goalInput.targetAmount <= 0 ||
			!Number.isFinite(goalInput.currentAmount) ||
			(goalInput.type !== "savings" && goalInput.type !== "debt") ||
			typeof goalInput.dueDate !== "string" ||
			!goalInput.dueDate
		) {
			toast.error("Invalid goal data.");
			return;
		}

		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			toast.error("Not authenticated");
			return;
		}

		const { error } = await supabase.from("goals").insert({
			user_id: user.id,
			wallet_id: goalInput.type === "savings" ? goalInput.wallet_id : null,
			name: goalInput.name,
			target_amount: goalInput.targetAmount,
			current_amount: goalInput.type === "savings" ? 0 : goalInput.currentAmount,
			due_date: goalInput.dueDate,
			icon: goalInput.icon,
			color: goalInput.color,
			type: goalInput.type,
		});

		if (error) {
			toast.error("Failed to add goal");
			return;
		}

		toast.success("Goal added!");
		setIsAddModalOpen(false);
		fetchGoals();
	};

	const handleUpdateGoal = async (goal: GoalUpdateInput) => {
		const parsedCurrentAmount = Number(
			goal.current_amount ?? goal.currentAmount ?? 0
		);
		const parsedTargetAmount = Number(goal.target_amount ?? goal.targetAmount ?? 0);
		const dueDate = goal.due_date ?? goal.dueDate ?? "";

		if (!Number.isFinite(parsedCurrentAmount) || !Number.isFinite(parsedTargetAmount) || !dueDate) {
			toast.error("Invalid goal data.");
			return;
		}

		const existingGoal = goals.find((g) => g.id === goal.id);
		const currentAmountChanged =
			existingGoal !== undefined && parsedCurrentAmount !== existingGoal.current_amount;

		if (goal.type === "savings" && currentAmountChanged) {
			toast.error("Savings goals are auto-tracked via wallet balance.");
			return;
		}

		const { error } = await supabase
			.from("goals")
			.update({
				name: goal.name,
				target_amount: parsedTargetAmount,
				current_amount: parsedCurrentAmount,
				due_date: dueDate,
				icon: goal.icon,
				color: goal.color,
			})
			.eq("id", goal.id);

		if (error) {
			toast.error("Failed to update goal");
			return;
		}

		toast.success("Goal updated!");
		setIsEditModalOpen(false);
		fetchGoals();
	};

	const handleDeleteGoal = async (id: number) => {
		const { error } = await supabase.from("goals").delete().eq("id", id);
		if (error) {
			toast.error("Failed to delete goal.");
			return;
		}
		toast.success("Goal deleted!");
		fetchGoals();
	};

	const filteredGoals = goals.filter((g) => {
		if (activeTab === "all") return true;
		return g.type === activeTab;
	});

	const totalTarget = goals.reduce((s, g) => s + g.target_amount, 0);
	const totalCurrent = goals.reduce((s, g) => s + g.current_amount, 0);
	const overallProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Goals</h1>
					<p className="text-sm text-muted-foreground">
						Track your savings and debt goals
					</p>
				</div>
				<Button onClick={() => setIsAddModalOpen(true)} size="sm" className="h-9 gap-2">
					<PlusIcon className="h-3.5 w-3.5" />
					Add Goal
				</Button>
			</div>

			{/* Goals Summary */}
			{!loading && goals.length > 0 && (
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<Card>
						<CardContent className="p-4">
							<div className="flex items-center gap-3">
								<div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
									<TargetIcon className="h-5 w-5 text-primary" />
								</div>
								<div>
									<p className="text-xs text-muted-foreground font-medium">Total Target</p>
									<p className="text-lg font-bold">{formatCurrency(totalTarget)}</p>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-4">
							<div className="flex items-center gap-3">
								<div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
									<TrophyIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
								</div>
								<div>
									<p className="text-xs text-muted-foreground font-medium">Progress</p>
									<p className="text-lg font-bold">{formatCurrency(totalCurrent)}</p>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-4">
							<div className="flex items-center gap-3">
								<div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
									<span className="text-sm font-bold text-blue-600 dark:text-blue-400">%</span>
								</div>
								<div>
									<p className="text-xs text-muted-foreground font-medium">Overall</p>
									<p className="text-lg font-bold">{overallProgress.toFixed(0)}%</p>
								</div>
							</div>
							<Progress value={overallProgress} className="h-1.5 mt-2" />
						</CardContent>
					</Card>
				</div>
			)}

			{/* Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList className="h-9">
					<TabsTrigger value="all" className="text-xs px-4">All</TabsTrigger>
					<TabsTrigger value="savings" className="text-xs px-4">Savings</TabsTrigger>
					<TabsTrigger value="debt" className="text-xs px-4">Debt</TabsTrigger>
				</TabsList>
			</Tabs>

			{/* Goals Grid */}
			{loading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{[...Array(3)].map((_, i) => (
						<Card key={i}>
							<CardContent className="p-5 space-y-3">
								<Skeleton className="h-5 w-32" />
								<Skeleton className="h-2 w-full" />
								<Skeleton className="h-8 w-24" />
							</CardContent>
						</Card>
					))}
				</div>
			) : filteredGoals.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-16">
						<div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
							<TargetIcon className="h-7 w-7 text-muted-foreground" />
						</div>
						<h3 className="text-base font-semibold mb-1">No goals yet</h3>
						<p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
							Set your first financial goal to start tracking your progress.
						</p>
						<Button onClick={() => setIsAddModalOpen(true)} size="sm" className="gap-2">
							<PlusIcon className="h-3.5 w-3.5" />
							Create Goal
						</Button>
					</CardContent>
				</Card>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{filteredGoals.map((goal, idx) => {
						const pct =
							goal.target_amount <= 0
								? goal.current_amount > 0
									? 100
									: 0
								: Math.min(100, (goal.current_amount / goal.target_amount) * 100);
						const daysLeft = getDaysRemaining(goal.due_date);
						const isCompleted = pct >= 100;
						const isOverdue = daysLeft <= 0 && !isCompleted;
						const isNearDue = daysLeft > 0 && daysLeft <= 7 && !isCompleted;

						return (
							<Card
								key={goal.id}
								className={cn(
									"overflow-hidden transition-all duration-200 hover:shadow-md animate-slide-up",
									isCompleted && "border-emerald-200 dark:border-emerald-900"
								)}
								style={{ animationDelay: `${idx * 80}ms`, animationFillMode: "both" }}
							>
								<CardHeader className="p-4 pb-2">
									<div className="flex justify-between items-start">
										<div className="flex items-center gap-2.5">
											<span className="text-xl">{goal.icon}</span>
											<div>
												<CardTitle className="text-sm font-semibold">{goal.name}</CardTitle>
												<div className="flex items-center gap-1.5 mt-0.5">
													<Badge
														variant={goal.type === "savings" ? "outline" : "secondary"}
														className="text-[10px] font-normal"
													>
														{goal.type}
													</Badge>
													{isCompleted && (
														<Badge className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 hover:bg-emerald-100">
															Completed
														</Badge>
													)}
												</div>
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
													onClick={() => {
														setCurrentGoal(goal);
														setIsEditModalOpen(true);
													}}
												>
													<PencilIcon className="mr-2 h-3.5 w-3.5" />
													Edit
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() => handleDeleteGoal(goal.id)}
													className="text-destructive focus:text-destructive"
												>
													<TrashIcon className="mr-2 h-3.5 w-3.5" />
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</CardHeader>

								<CardContent className="p-4 pt-2">
									<div className="flex justify-between items-center text-xs text-muted-foreground mb-1.5">
										<span>Progress</span>
										<span className="font-semibold text-foreground">{pct.toFixed(0)}%</span>
									</div>
									<div className="relative">
										<Progress
											value={pct}
											className="h-2"
										/>
										<div
											className="absolute inset-0 h-2 rounded-full"
											style={{
												background: goal.color,
												width: `${Math.min(100, pct)}%`,
												opacity: 0.8,
												borderRadius: "9999px",
											}}
										/>
									</div>

									<div className="mt-3 space-y-1">
										<div className="flex justify-between text-xs">
											<span className="text-muted-foreground">Current</span>
											<span className="font-medium tabular-nums">{formatCurrency(goal.current_amount)}</span>
										</div>
										<div className="flex justify-between text-xs">
											<span className="text-muted-foreground">Target</span>
											<span className="font-medium tabular-nums">{formatCurrency(goal.target_amount)}</span>
										</div>
									</div>
								</CardContent>

								<CardFooter className="px-4 py-3 border-t bg-muted/30">
									<div className="flex items-center gap-1.5 text-xs">
										{isOverdue ? (
											<>
												<AlertTriangleIcon className="h-3 w-3 text-rose-500" />
												<span className="text-rose-600 dark:text-rose-400 font-medium">Overdue</span>
											</>
										) : isNearDue ? (
											<>
												<CalendarIcon className="h-3 w-3 text-amber-500" />
												<span className="text-amber-600 dark:text-amber-400 font-medium">
													{daysLeft} day{daysLeft !== 1 ? "s" : ""} left
												</span>
											</>
										) : isCompleted ? (
											<>
												<TrophyIcon className="h-3 w-3 text-emerald-500" />
												<span className="text-emerald-600 dark:text-emerald-400 font-medium">
													Goal achieved!
												</span>
											</>
										) : (
											<>
												<CalendarIcon className="h-3 w-3 text-muted-foreground" />
												<span className="text-muted-foreground">
													{daysLeft} day{daysLeft !== 1 ? "s" : ""} remaining
												</span>
											</>
										)}
									</div>
								</CardFooter>
							</Card>
						);
					})}
				</div>
			)}

			<AddGoalModal
				isOpen={isAddModalOpen}
				onClose={() => setIsAddModalOpen(false)}
				onAdd={handleAddGoal}
			/>

			{currentGoal && (
				<EditGoalModal
					isOpen={isEditModalOpen}
					onClose={() => setIsEditModalOpen(false)}
					goal={currentGoal}
					onUpdate={handleUpdateGoal}
				/>
			)}
		</div>
	);
}
