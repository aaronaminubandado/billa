"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sample categories with colors
const categories = [
  { id: 1, name: "Housing", color: "#22c55e", icon: "🏠" },
  { id: 2, name: "Food", color: "#f97316", icon: "🍔" },
  { id: 3, name: "Transportation", color: "#3b82f6", icon: "🚗" },
  { id: 4, name: "Entertainment", color: "#a855f7", icon: "🎬" },
  { id: 5, name: "Shopping", color: "#ec4899", icon: "🛒" },
  { id: 6, name: "Utilities", color: "#64748b", icon: "💡" },
  { id: 7, name: "Healthcare", color: "#ef4444", icon: "🏥" },
  { id: 8, name: "Education", color: "#eab308", icon: "🎓" },
];

// Sample top expenses data
const topExpensesData = [
  {
    id: 1,
    name: "Rent",
    amount: 1200,
    date: "2023-04-01",
    category: categories[0],
  },
  {
    id: 2,
    name: "Groceries",
    amount: 350,
    date: "2023-04-15",
    category: categories[1],
  },
  {
    id: 3,
    name: "Car Payment",
    amount: 300,
    date: "2023-04-05",
    category: categories[2],
  },
  {
    id: 4,
    name: "Dining Out",
    amount: 250,
    date: "2023-04-20",
    category: categories[1],
  },
  {
    id: 5,
    name: "Electricity Bill",
    amount: 120,
    date: "2023-04-10",
    category: categories[5],
  },
  {
    id: 6,
    name: "Streaming Services",
    amount: 50,
    date: "2023-04-15",
    category: categories[3],
  },
  {
    id: 7,
    name: "Clothing",
    amount: 150,
    date: "2023-04-22",
    category: categories[4],
  },
  {
    id: 8,
    name: "Doctor Visit",
    amount: 100,
    date: "2023-04-18",
    category: categories[6],
  },
];

// Sort expenses by amount (descending)
const sortedExpenses = [...topExpensesData].sort((a, b) => b.amount - a.amount);

// Get top 5 expenses
const top5Expenses = sortedExpenses.slice(0, 5);

// Custom tooltip
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <div className="bg-background border rounded-md shadow-md p-3 text-sm">
        <p className="font-medium mb-1">{data.name}</p>
        <p className="text-muted-foreground">
          Amount: ${data.amount.toLocaleString()}
        </p>
        <p className="text-muted-foreground">
          Category: {data.category.icon} {data.category.name}
        </p>
        <p className="text-muted-foreground">
          Date: {new Date(data.date).toLocaleDateString()}
        </p>
      </div>
    );
  }
  return null;
};

interface TopExpensesProps {
  detailed?: boolean;
}

export function TopExpenses({ detailed = false }: TopExpensesProps) {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="h-full">
      {detailed ? (
        <Tabs defaultValue="bar" className="w-full h-full">
          <TabsList className="mb-4">
            <TabsTrigger value="bar">Bar Chart</TabsTrigger>
            <TabsTrigger value="table">Table</TabsTrigger>
          </TabsList>

          <TabsContent value="bar" className="h-[calc(100%-40px)]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedExpenses}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                />
                <XAxis type="number" tickFormatter={(value) => `$${value}`} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  tickFormatter={(value) =>
                    value.length > 15 ? `${value.substring(0, 15)}...` : value
                  }
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="amount" name="Amount">
                  {sortedExpenses.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.category.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent
            value="table"
            className="h-[calc(100%-40px)] overflow-auto"
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Expense</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">
                      {expense.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: expense.category.color }}
                        />
                        {expense.category.icon} {expense.category.name}
                      </div>
                    </TableCell>
                    <TableCell>${expense.amount.toLocaleString()}</TableCell>
                    <TableCell>{formatDate(expense.date)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={top5Expenses}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `$${value}`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="amount" name="Amount">
              {top5Expenses.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.category.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
