"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import ButterflyLoader from "../butterfly-loader"; // Ensure this path is correct

// Interface for the combined data used by the chart (can be moved to a shared types file)
export interface ChartDataPoint {
  month: string; // "YYYY-MM", will be used as dataKey for XAxis
  caloriesIntake?: number;
  caloriesBurned?: number;
}

const chartConfig = {
  caloriesIntake: {
    label: "Calories Consumed",
    color: "hsl(var(--chart-1))",
  },
  caloriesBurned: {
    label: "Calories Burned",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

interface MonthlyCaloriesChartProps {
  chartData: ChartDataPoint[];
  isLoading: boolean;
  error: string | null;
}

export function MonthlyCaloriesChart({
  chartData,
  isLoading,
  error,
}: MonthlyCaloriesChartProps) {
  const [timeRange, setTimeRange] = React.useState<"6m" | "12m">("6m");

  // Data fetching logic and related states (loading, error, raw chartData) are removed.
  // These are now passed as props.

  const filteredData = React.useMemo(() => {
    if (!chartData || !chartData.length) return [];
    // Assuming chartData prop is already sorted by month from the parent
    const numMonths = timeRange === "6m" ? 6 : 12;
    const startIndex = Math.max(0, chartData.length - numMonths);
    return chartData.slice(startIndex);
  }, [chartData, timeRange]);

  if (error) {
    return (
      <Card className="pt-0">
        <CardHeader>
          <CardTitle>Monthly Calorie Tracking</CardTitle>
          <CardDescription>Error loading data: {error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="pt-0 h-[380px] flex items-center justify-center">
        <ButterflyLoader />
      </Card>
    );
  }

  if (!filteredData.length && !isLoading && !error) {
    return (
      <Card className="pt-0 h-[380px]">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle>Monthly Calorie Tracking</CardTitle>
            <CardDescription>
              Consumed vs. Burned for the selected period.
            </CardDescription>
          </div>
          {/* Select remains as it controls client-side filtering */}
        </CardHeader>
        <CardContent className="flex h-[250px] items-center justify-center">
          <p className="text-muted-foreground">No calorie data available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Monthly Calorie Tracking</CardTitle>
          <CardDescription>
            Consumed vs. Burned for the selected period.
          </CardDescription>
        </div>
        <Select
          value={timeRange}
          onValueChange={(value) => setTimeRange(value as "6m" | "12m")}
        >
          <SelectTrigger
            className="hidden w-[180px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Select a time range"
          >
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="6m" className="rounded-lg">
              Past 6 months
            </SelectItem>
            <SelectItem value="12m" className="rounded-lg">
              Past 12 months
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData} margin={{ left: 12, right: 12 }}>
            <defs>
              <linearGradient
                id="fillCaloriesIntake"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--chart-3)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--chart-3)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient
                id="fillCaloriesBurned"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--chart-1)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--chart-1)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={20}
              tickFormatter={(value: string) => {
                const date = new Date(value + "-01");
                return date.toLocaleDateString("en-US", {
                  month: "short",
                });
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(label: string) => {
                    const date = new Date(label + "-01");
                    return date.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    });
                  }}
                  indicator="dot"
                  formatter={(value, name) => [
                    `${(value as number).toLocaleString()} `,
                    chartConfig[name as keyof typeof chartConfig]?.label ||
                      name,
                  ]}
                />
              }
            />
            <Area
              dataKey="caloriesIntake"
              type="monotoneX"
              fill="url(#fillCaloriesIntake)"
              stroke="var(--chart-3)"
              stackId="a"
            />
            <Area
              dataKey="caloriesBurned"
              type="monotoneX"
              fill="url(#fillCaloriesBurned)"
              stroke="var(--chart-1)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}