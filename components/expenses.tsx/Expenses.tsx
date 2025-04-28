import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusIcon } from 'lucide-react'

export default function Expenses() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
          <CardDescription>You have 3 expenses this month.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {[
              { category: "Groceries", amount: 50, date: "2023-06-15" },
              { category: "Transportation", amount: 30, date: "2023-06-14" },
              { category: "Entertainment", amount: 80, date: "2023-06-12" },
            ].map((expense, index) => (
              <div key={index} className="flex items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{expense.category}</p>
                  <p className="text-sm text-muted-foreground">{expense.date}</p>
                </div>
                <div className="ml-auto font-medium">${expense.amount}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Add New Expense</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" placeholder="Enter amount" type="number" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="groceries">Groceries</SelectItem>
                  <SelectItem value="transportation">Transportation</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" />
            </div>
            <Button className="w-full"><PlusIcon className="mr-2 h-4 w-4" /> Add Expense</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}