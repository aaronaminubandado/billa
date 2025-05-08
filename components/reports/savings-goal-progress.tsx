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
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Sample savings goals data
const savingsGoalsData = [
  {
    id: 1,
    name: "Emergency Fund",
    target: 10000,
    current: 8500,
    deadline: "2023-12-31",
    color: "#3b82f6",
  },
  {
    id: 2,
    name: "Vacation",
    target: 3000,
    current: 1200,
    deadline: "2023-08-15",
    color: "#22c55e",
  },
  {
    id: 3,
    name: "New Car",
    target: 20000,
    current: 5000,
    deadline: "2024-06-30",
    color: "#f97316",
  },
  {
    id: 4,
    name: "Home Down Payment",
    target: 50000,
    current: 15000,
    deadline: "2025-01-01",
    color: "#a855f7",
  },
  {
    id: 5,
    name: "Wedding",
    target: 15000,
    current: 7500,
    deadline: "2023-10-15",
    color: "#ec4899",
  },
];

// Custom tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const percentComplete = Math.round((data.current / data.target) * 100);

    return (
      <div className="bg-background border rounded-md shadow-md p-3 text-sm">
        <p className="font-medium mb-1">{data.name}</p>
        <p className="text-muted-foreground">
          Target: ${data.target.toLocaleString()}
        </p>
        <p className="text-muted-foreground">
          Current: ${data.current.toLocaleString()}
        </p>
        <p className="text-muted-foreground">Progress: {percentComplete}%</p>
        <p className="text-muted-foreground">
          Remaining: ${(data.target - data.current).toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

interface SavingsGoalProgressProps {
  detailed?: boolean;
}

export function SavingsGoalProgress({
  detailed = false,
}: SavingsGoalProgressProps) {
  // Process data for chart
  const chartData = savingsGoalsData.map((goal) => ({
    ...goal,
    percentComplete: (goal.current / goal.target) * 100,
    remaining: goal.target - goal.current,
  }));

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
        <div className="space-y-6">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                />
                <XAxis
                  type="number"
                  tickFormatter={(value) => `${value}%`}
                  domain={[0, 100]}
                />
                <YAxis type="category" dataKey="name" width={120} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="percentComplete" name="Progress (%)">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Goal</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Current</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Deadline</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {savingsGoalsData.map((goal) => {
                const percentComplete = Math.round(
                  (goal.current / goal.target) * 100
                );

                return (
                  <TableRow key={goal.id}>
                    <TableCell className="font-medium">{goal.name}</TableCell>
                    <TableCell>${goal.target.toLocaleString()}</TableCell>
                    <TableCell>${goal.current.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={percentComplete}
                          className={`h-2 w-20 bg-[${goal.color}]`}
                        />
                        <span className="text-xs">{percentComplete}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(goal.deadline)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis
              yAxisId="left"
              orientation="left"
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="current"
              name="Current Amount"
              fill="#3b82f6"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
            <Bar
              yAxisId="left"
              dataKey="remaining"
              name="Remaining"
              fill="#94a3b8"
              stackId="a"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  fillOpacity={0.3}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
