import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusIcon } from 'lucide-react'

export default function Income() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Income Sources</CardTitle>
          <CardDescription>You have 2 income sources this month.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {[
              { source: "Salary", amount: 3000, date: "2023-06-01" },
              { source: "Freelance", amount: 1000, date: "2023-06-15" },
            ].map((income, index) => (
              <div key={index} className="flex items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{income.source}</p>
                  <p className="text-sm text-muted-foreground">{income.date}</p>
                </div>
                <div className="ml-auto font-medium">${income.amount}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Add New Income</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="income-amount">Amount</Label>
              <Input id="income-amount" placeholder="Enter amount" type="number" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="income-source">Source</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salary">Salary</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                  <SelectItem value="investments">Investments</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="income-date">Date</Label>
              <Input id="income-date" type="date" />
            </div>
            <Button className="w-full"><PlusIcon className="mr-2 h-4 w-4" /> Add Income</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}