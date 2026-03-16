// Edit Wallet Modal Component
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
	TooltipProvider,
} from "@/components/ui/tooltip";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Wallet type options
const walletTypes = [
	{ value: "cash", label: "Cash", icon: "💵" },
	{ value: "bank", label: "Bank Account", icon: "🏦" },
	{ value: "card", label: "Credit Card", icon: "💳" },
	{ value: "savings", label: "Savings", icon: "🏆" },
	{ value: "mobile", label: "Mobile Wallet", icon: "📱" },
	{ value: "investment", label: "Investment", icon: "📈" },
];

// Currency options
const currencies = [
	{ value: "USD", label: "US Dollar ($)" },
	{ value: "EUR", label: "Euro (€)" },
	{ value: "GBP", label: "British Pound (£)" },
	{ value: "JPY", label: "Japanese Yen (¥)" },
	{ value: "CAD", label: "Canadian Dollar (C$)" },
	{ value: "AUD", label: "Australian Dollar (A$)" },
	{ value: "INR", label: "Indian Rupee (₹)" },
];

interface EditWalletModalProps {
	isOpen: boolean;
	onClose: () => void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	wallet: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onUpdate: (wallet: any) => void;
}

export function EditWalletModal({
	isOpen,
	onClose,
	wallet,
	onUpdate,
}: EditWalletModalProps) {
	const [name, setName] = useState("");
	const [balance, setBalance] = useState("");
	const [type, setType] = useState("bank");
	const [currency, setCurrency] = useState("USD");
	const isMobile = useMediaQuery("(max-width: 768px)");

	// Set initial values when wallet changes
	useEffect(() => {
		if (wallet) {
			setName(wallet.name);
			setBalance(wallet.balance.toString());
			setType(wallet.type);
			setCurrency(wallet.currency);
		}
	}, [wallet]);

	// Get icon for selected wallet type
	const getIconForType = (type: string) => {
		return walletTypes.find((t) => t.value === type)?.icon || "💰";
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Validate form
		if (!name.trim()) {
			// Add proper form validation and error messages
			toast.error("Please enter a wallet name");
			return;
		}

		// Create updated wallet object
		const updatedWallet = {
			...wallet,
			name,
			type,
			currency,
			icon: getIconForType(type),
		};

		onUpdate(updatedWallet);
	};
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent
				className={cn(
					"sm:max-w-[500px]",
					isMobile
						? "w-full h-[100dvh] rounded-none max-h-[100dvh]"
						: ""
				)}
			>
				<DialogHeader>
					<DialogTitle>Edit Wallet</DialogTitle>
					<DialogDescription>
						Update your wallet or account details
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit}>
					<div className="space-y-4 py-2">
						<div className="space-y-2">
							<Label htmlFor="name">Wallet Name</Label>
							<Input
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="e.g., Cash Wallet, Main Bank Account"
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="type">Wallet Type</Label>
							<Select value={type} onValueChange={setType}>
								<SelectTrigger id="type">
									<SelectValue placeholder="Select type" />
								</SelectTrigger>
								<SelectContent>
									{walletTypes.map((type) => (
										<SelectItem
											key={type.value}
											value={type.value}
										>
											<div className="flex items-center">
												<span className="mr-2">
													{type.icon}
												</span>
												<span>{type.label}</span>
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="currency">Currency</Label>
							<Select
								value={currency}
								onValueChange={setCurrency}
							>
								<SelectTrigger id="currency">
									<SelectValue placeholder="Select currency" />
								</SelectTrigger>
								<SelectContent>
									{currencies.map((currency) => (
										<SelectItem
											key={currency.value}
											value={currency.value}
										>
											{currency.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="balance">Current Balance</Label>

							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<div>
											<Input
												id="balance"
												type="number"
												step="0.01"
												value={balance}
												disabled
												className="cursor-not-allowed bg-muted"
											/>
										</div>
									</TooltipTrigger>

									<TooltipContent className="max-w-[250px] text-center">
										<p>
											Balance cannot be edited manually.
											It is automatically calculated based
											on your transactions.
										</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</div>
					</div>

					<DialogFooter className="mt-6">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
						>
							Cancel
						</Button>
						<Button type="submit">Update Wallet</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
