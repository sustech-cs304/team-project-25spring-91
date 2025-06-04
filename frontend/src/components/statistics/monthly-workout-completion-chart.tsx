"use client"

import React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface YearlyWorkouts {
  year: number;
  months: MonthlyWorkout[];
}

interface MonthlyWorkout {
  month: number;
  monthName: string;
  count: number;
}

interface ComponentProps {
  chartData: YearlyWorkouts[];
}

const chartConfig = {
  count: {
    label: "Workouts",
    color: "var(--chart-1)",
  },
};

const ALL_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function AnnualBarChart({ chartData = [] }: ComponentProps) {
  const years = React.useMemo(() => {
    const uniqueYears = new Set(chartData.map(item => item.year));
    return Array.from(uniqueYears).sort((a, b) => b - a);
  }, [chartData]);

  const [selectedYear, setSelectedYear] = React.useState(years.length > 0 ? years[0].toString() : new Date().getFullYear().toString());

  /**
   * AI-generated-content
   * tool: Grok 
   * version: 3
   * usage: I used the prompt "Based on the graph code and data interface, how to
   * transform the data to fit the code for the graph" and then directly copy it
   */
  const completeData = React.useMemo(() => {
    // Find the yearly data for the selected year
    const yearData = chartData.find(year => year.year.toString() === selectedYear);
    
    // Create a map for quick lookup of existing monthly data
    const monthDataMap = new Map();
    if (yearData) {
      yearData.months.forEach(monthData => {
        monthDataMap.set(monthData.monthName, monthData.count);
      });
    }
    
    // Create a complete dataset with all months
    return ALL_MONTHS.map(monthName => {
      return {
        year: parseInt(selectedYear),
        monthName,
        count: monthDataMap.get(monthName) || 0
      };
    });
  }, [selectedYear, chartData]);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <Card className="bg-background shadow-none border-0">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1 text-center sm:text-left">
            <CardTitle>Total Workouts Completed Per Month</CardTitle>
            <CardDescription>
              Your year-long workout completion
            </CardDescription>
          </div>
          <Select 
            value={selectedYear} 
            onValueChange={setSelectedYear}
            disabled={years.length === 0}
          >
            <SelectTrigger className="w-[160px] rounded-lg sm:ml-auto" aria-label="Select a year">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {years.map(year => (
                <SelectItem key={year} value={year.toString()} className="rounded-lg">
                  Year {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
            <BarChart data={completeData}>
              <defs>
                <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis 
                dataKey="monthName" 
                tickLine={false} 
                axisLine={false} 
                tickMargin={8}
                interval={0}
                height={60}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => value}
                    indicator="dot"
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="count" fill="url(#fillCount)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}