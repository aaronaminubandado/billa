"use client";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
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

// Sample wallets data
const walletsData = [
  {
    id: 1,
    name: "Checking Account",
    balance: 3500,
    spent: 2800,
    income: 3200,
    color: "#3b82f6",
  },
  {
    id: 2,
    name: "Savings Account",
    balance: 12000,
    spent: 500,
    income: 1500,
    color: "#22c55e",
  },
  {
    id: 3,
    name: "Credit Card",
    balance: -1200,
    spent: 3500,
    income: 0,
    color: "#ef4444",
  },
  {
    id: 4,
    name: "Cash",
    balance: 300,
    spent: 700,
    income: 800,
    color: "#f97316",
  },
  {
    id: 5,
    name: "Investment Account",
    balance: 25000,
    spent: 0,
    income: 2000,
    color: "#a855f7",
  },
];

// Custom tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const percentOfTotal = Math.round((data.spent / totalSpent) * 100);

    return (
      <div className="bg-background border rounded-md shadow-md p-3 text-sm">
        <p className="font-medium mb-1">{data.name}</p>
        <p className="text-muted-foreground">
          Spent: ${data.spent.toLocaleString()}
        </p>
        <p className="text-muted-foreground">
          Income: ${data.income.toLocaleString()}
        </p>
        <p className="text-muted-foreground">
          Balance: ${data.balance.toLocaleString()}
        </p>
        <p className="text-muted-foreground">
          % of Total Spending: {percentOfTotal}%
        </p>
      </div>
    );
  }
  return null;
};

// Calculate total spent
const totalSpent = walletsData.reduce((sum, wallet) => sum + wallet.spent, 0);

interface SpendingByWalletProps {
  detailed?: boolean;
}

export function SpendingByWallet({ detailed = false }: SpendingByWalletProps) {
  return (
    <div className="h-full">
      {detailed ? (
        <Tabs defaultValue="pie" className="w-full h-full">
          <TabsList className="mb-4">
            <TabsTrigger value="pie">Pie Chart</TabsTrigger>
            <TabsTrigger value="bar">Bar Chart</TabsTrigger>
            <TabsTrigger value="table">Table</TabsTrigger>
          </TabsList>

          <TabsContent value="pie" className="h-[calc(100%-40px)]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={walletsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="spent"
                  nameKey="name"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {walletsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="bar" className="h-[calc(100%-40px)]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={walletsData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="spent" name="Spent" fill="#8884d8">
                  {walletsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
                <Bar dataKey="income" name="Income" fill="#82ca9d">
                  {walletsData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      fillOpacity={0.6}
                    />
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
                  <TableHead>Wallet</TableHead>
                  <TableHead>Spent</TableHead>
                  <TableHead>Income</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>% of Total Spending</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {walletsData.map((wallet) => {
                  const percentOfTotal = Math.round(
                    (wallet.spent / totalSpent) * 100
                  );

                  return (
                    <TableRow key={wallet.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: wallet.color }}
                          />
                          {wallet.name}
                        </div>
                      </TableCell>
                      <TableCell>${wallet.spent.toLocaleString()}</TableCell>
                      <TableCell>${wallet.income.toLocaleString()}</TableCell>
                      <TableCell>${wallet.balance.toLocaleString()}</TableCell>
                      <TableCell>{percentOfTotal}%</TableCell>
                    </TableRow>
                  );
                })}
                <TableRow>
                  <TableCell className="font-medium">Total</TableCell>
                  <TableCell className="font-medium">
                    ${totalSpent.toLocaleString()}
                  </TableCell>
                  <TableCell className="font-medium">
                    $
                    {walletsData
                      .reduce((sum, wallet) => sum + wallet.income, 0)
                      .toLocaleString()}
                  </TableCell>
                  <TableCell className="font-medium">
                    $
                    {walletsData
                      .reduce((sum, wallet) => sum + wallet.balance, 0)
                      .toLocaleString()}
                  </TableCell>
                  <TableCell>100%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={walletsData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="spent"
              nameKey="name"
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {walletsData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
