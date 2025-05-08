"use client"

import React from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// sample income vs expenses data
const generateIncomeVsExpensesData = (timePeriod: string) => {
  // In a real app, this would fetch data based on the time period
  let dataPoints = []
  let labels = []
  
  switch (timePeriod) {
    case 'week':
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      break
    case 'month':
      labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4']
      break
    case 'quarter':
      labels = ['Month 1', 'Month 2', 'Month 3']
      break
    case 'year':
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      break
    default:
      labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4']
  }
  
  // Base values for income and expenses
  const baseIncome = timePeriod === 'week' ? 300 : 
                    timePeriod === 'month' ? 1200 : 
                    timePeriod === 'quarter' ? 4800 : 
                    timePeriod === 'year' ? 4800 : 1200
  
  const baseExpenses = timePeriod === 'week' ? 200 : 
                      timePeriod === 'month' ? 800 : 
                      timePeriod === 'quarter' ? 3200 : 
                      timePeriod === 'year' ? 3200 : 800
  
  // Generate data points
  dataPoints = labels.map(label => {
    // Add some randomness
    const incomeRandomFactor = 0.9 + Math.random() * 0.3 // Between 0.9 and 1.2
    const expensesRandomFactor = 0.8 + Math.random() * 0.4 // Between 0.8 and 1.2
    
    const income = Math.round(baseIncome * incomeRandomFactor)
    const expenses = Math.round(baseExpenses * expensesRandomFactor)
    
    return {
      name: label,
      income: income,
      expenses: expenses,
      balance: income - expenses
    }
  })
  
  return dataPoints
}

// Custom tooltip for the chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-md shadow-md p-3 text-sm">
        <p className="font-medium mb-1">{label}</p>
        <p className="text-green-600 dark:text-green-400">
          Income: ${payload[0].value.toLocaleString()}
        </p>
        <p className="text-red-600 dark:text-red-400">
          Expenses: ${payload[1].value.toLocaleString()}
        </p>
        <p className={payload[2].value >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400"}>
          Balance: ${payload[2].value.toLocaleString()}
        </p>
      </div>
    )
  }
  return null
}

interface IncomeVsExpensesChartProps {
  timePeriod: string
}

export function IncomeVsExpensesChart({ timePeriod }: IncomeVsExpensesChartProps) {
  const data = generateIncomeVsExpensesData(timePeriod)
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="income" 
          stackId="1" 
          stroke="#22c55e" 
          fill="#22c55e" 
          fillOpacity={0.6} 
          name="Income"
        />
        <Area 
          type="monotone" 
          dataKey="expenses" 
          stackId="2" 
          stroke="#ef4444" 
          fill="#ef4444" 
          fillOpacity={0.6}
          name="Expenses" 
        />
        <Area 
          type="monotone" 
          dataKey="balance" 
          stackId="3" 
          stroke="#3b82f6" 
          fill="#3b82f6" 
          fillOpacity={0.6}
          name="Balance" 
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}