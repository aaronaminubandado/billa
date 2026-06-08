"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
	PlusIcon,
	MoreHorizontalIcon,
	PencilIcon,
	TrashIcon,
	TagIcon,
} from "lucide-react";
import { AddCategoryModal } from "@/components/categories/add-category-modal";
import { EditCategoryModal } from "@/components/categories/edit-category-modal";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface Category {
	id: number;
	name: string;
	type: string;
	color: string;
	icon: string;
	transactionCount: number;
}

export default function CategoriesPage() {
	const [categories, setCategories] = useState<Category[]>([]);
	const [loading, setLoading] = useState(true);
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
	const [typeFilter, setTypeFilter] = useState<string>("all");
	const supabase = createClient();

	const fetchCategories = async () => {
		try {
			const {
				data: { user },
				error: userError,
			} = await supabase.auth.getUser();

			if (userError || !user) {
				toast.error(userError?.message || "Authentication error.");
				return false;
			}

			const { data, error } = await supabase
				.from("categories")
				.select(`
					id, name, type, color, icon,
					transactions:transactions(count)
				`)
				.eq("user_id", user.id);

			if (error) {
				toast.error("Failed to load categories");
				return false;
			}

			const formatted = data.map((category) => ({
				...category,
				transactionCount: category.transactions?.[0]?.count || 0,
			}));

			setCategories(formatted);
			return true;
		} catch {
			toast.error("Unexpected error loading categories");
			return false;
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchCategories();
	}, []);

	const filteredCategories = categories.filter(
		(c) => typeFilter === "all" || c.type === typeFilter
	);
	const hasFilters = typeFilter !== "all";

	const handleDeleteCategory = async (category: Category) => {
		if (category.transactionCount > 0) {
			toast.warning("Cannot delete a category with existing transactions.");
			return;
		}

		const { error } = await supabase
			.from("categories")
			.delete()
			.eq("id", category.id);

		if (error) {
			toast.error("Failed to delete category.");
			return;
		}

		toast.success("Category deleted!");
		await fetchCategories();
	};

	const handleEditClick = (category: Category) => {
		setCurrentCategory(category);
		setIsEditModalOpen(true);
	};

	const handleUpdateCategory = async (updatedCategory: Category) => {
		try {
			const {
				data: { user },
				error: userError,
			} = await supabase.auth.getUser();

			if (userError || !user) {
				toast.error("Authentication error.");
				return;
			}

			const { id, transactionCount, ...rest } = updatedCategory;
			void transactionCount;
			const { error } = await supabase
				.from("categories")
				.update({ ...rest, user_id: user.id })
				.eq("id", id)
				.eq("user_id", user.id)
				.select();

			if (error) {
				toast.error(`Failed to update category: ${error.message}`);
				return;
			}

			setIsEditModalOpen(false);
			const success = await fetchCategories();
			if (success) toast.success("Category updated!");
		} catch {
			toast.error("An unexpected error occurred.");
		}
	};

	const handleAddCategory = async (newCategory: Category) => {
		try {
			const {
				data: { user },
				error: userError,
			} = await supabase.auth.getUser();

			if (userError || !user) {
				toast.error("Authentication error.");
				return;
			}

			const { error } = await supabase
				.from("categories")
				.insert([{ ...newCategory, user_id: user.id }])
				.select();

			if (error) {
				toast.error(`Failed to add category: ${error.message}`);
				return;
			}

			setIsAddModalOpen(false);
			const success = await fetchCategories();
			if (success) toast.success("Category added!");
		} catch {
			toast.error("An unexpected error occurred.");
		}
	};

	const expenseCount = categories.filter((c) => c.type === "expense").length;
	const incomeCount = categories.filter((c) => c.type === "income").length;

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Categories</h1>
					<p className="text-sm text-muted-foreground">
						Organize your transactions with categories
					</p>
				</div>
				<Button onClick={() => setIsAddModalOpen(true)} size="sm" className="h-9 gap-2">
					<PlusIcon className="h-3.5 w-3.5" />
					Add Category
				</Button>
			</div>

			{/* Summary */}
			{!loading && categories.length > 0 && (
				<div className="grid grid-cols-2 sm:grid-cols-3 gap-3 min-w-0">
					<Card>
						<CardContent className="p-4 flex items-center gap-3">
							<div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
								<TagIcon className="h-4 w-4 text-primary" />
							</div>
							<div>
								<p className="text-xs text-muted-foreground">Total</p>
								<p className="text-lg font-bold">{categories.length}</p>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-4 flex items-center gap-3">
							<div className="h-9 w-9 rounded-xl bg-rose-100 dark:bg-rose-500/10 flex items-center justify-center">
								<span className="text-xs font-bold text-rose-600 dark:text-rose-400">E</span>
							</div>
							<div>
								<p className="text-xs text-muted-foreground">Expense</p>
								<p className="text-lg font-bold">{expenseCount}</p>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-4 flex items-center gap-3">
							<div className="h-9 w-9 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
								<span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">I</span>
							</div>
							<div>
								<p className="text-xs text-muted-foreground">Income</p>
								<p className="text-lg font-bold">{incomeCount}</p>
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Filter */}
			<div className="flex items-center gap-3">
				<Select value={typeFilter} onValueChange={setTypeFilter}>
					<SelectTrigger className="w-[160px] h-9 text-sm">
						<SelectValue placeholder="Filter by type" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Types</SelectItem>
						<SelectItem value="expense">Expense</SelectItem>
						<SelectItem value="income">Income</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Categories Grid */}
			{loading ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{[...Array(6)].map((_, i) => (
						<Card key={i}>
							<CardContent className="p-4 flex items-center gap-3">
								<Skeleton className="h-10 w-10 rounded-xl" />
								<div className="space-y-1.5 flex-1">
									<Skeleton className="h-4 w-24" />
									<Skeleton className="h-3 w-16" />
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			) : filteredCategories.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-16">
						<div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
							<TagIcon className="h-7 w-7 text-muted-foreground" />
						</div>
						<h3 className="text-base font-semibold mb-1">No categories found</h3>
						{hasFilters ? (
							<>
								<p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
									No categories match the current filters.
								</p>
								<Button onClick={() => setTypeFilter("all")} size="sm" className="gap-2">
									Clear Filters
								</Button>
							</>
						) : (
							<>
								<p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
									Create categories to organize your transactions.
								</p>
								<Button onClick={() => setIsAddModalOpen(true)} size="sm" className="gap-2">
									<PlusIcon className="h-3.5 w-3.5" />
									Create Category
								</Button>
							</>
						)}
					</CardContent>
				</Card>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
					{filteredCategories.map((category, idx) => (
						<Card
							key={category.id}
							className="overflow-hidden transition-all duration-200 hover:shadow-md animate-slide-up"
							style={{ animationDelay: `${idx * 50}ms`, animationFillMode: "both" }}
						>
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div
											className="h-10 w-10 rounded-xl flex items-center justify-center text-lg"
											style={{
												backgroundColor: `${category.color}15`,
											}}
										>
											{category.icon}
										</div>
										<div>
											<h3 className="text-sm font-semibold">{category.name}</h3>
											<div className="flex items-center gap-2 mt-0.5">
												<Badge
													variant={category.type === "income" ? "outline" : "secondary"}
													className={cn(
														"text-[10px] font-normal",
														category.type === "income"
															? "border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400"
															: "border-rose-200 text-rose-700 dark:border-rose-800 dark:text-rose-400"
													)}
												>
													{category.type.charAt(0).toUpperCase() + category.type.slice(1)}
												</Badge>
												<span className="text-[10px] text-muted-foreground">
													{category.transactionCount} transaction{category.transactionCount !== 1 ? "s" : ""}
												</span>
											</div>
										</div>
									</div>

									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="ghost"
												size="icon"
												className="h-7 w-7 rounded-lg"
												aria-label="Open actions menu"
											>
												<MoreHorizontalIcon className="h-3.5 w-3.5" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem onClick={() => handleEditClick(category)}>
												<PencilIcon className="mr-2 h-3.5 w-3.5" />
												Edit
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => handleDeleteCategory(category)}
												className="text-destructive focus:text-destructive"
											>
												<TrashIcon className="mr-2 h-3.5 w-3.5" />
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			<AddCategoryModal
				isOpen={isAddModalOpen}
				onClose={() => setIsAddModalOpen(false)}
				onAdd={handleAddCategory}
			/>

			{currentCategory && (
				<EditCategoryModal
					isOpen={isEditModalOpen}
					onClose={() => setIsEditModalOpen(false)}
					category={currentCategory}
					onUpdate={handleUpdateCategory}
				/>
			)}
		</div>
	);
}
