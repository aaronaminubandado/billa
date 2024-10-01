import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { SettingsIcon, BarChartIcon, ArrowDownIcon, ArrowUpIcon, PiggyBankIcon, LineChartIcon } from 'lucide-react'
import Overview from '@/components/overview/Overview' 
import Expenses from '@/components/expenses.tsx/Expenses'
import Income from '@/components/income/Income'
import Budgeting from '@/components/budgeting/Budgeting'
import Reports from '@/components/reports/Reports'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div></div>
  )
}