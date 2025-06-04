"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"

interface YearlyVolume {
  year: number;
  months: MonthlyVolume[];
}

interface MonthlyVolume {
  month: number;
  monthName: string;
  volume: number;
}

interface ProcessedDataItem {
  year: number;
  monthName: string;
  volume: number;
  label: string;
}

interface ComponentProps {
  chartData: YearlyVolume[];
}

const chartConfig = {
  views: {
    label: "Workout Volume",
  },
  count: {
    label: "Count",
    color: "var(--chart-1)",
  }
} satisfies ChartConfig

export function AnnualLineChart({ chartData }: ComponentProps) {
  const [timeRange, setTimeRange] = React.useState("past-1-year");
  
  /**
   * AI-generated-content
   * tool: Grok 
   * version: 3
   * usage: I used the prompt "Based on the graph code and data interface, how to
   * transform the data to fit the code for the graph" and then directly copy it
   */

  // Process data for the chart
  const processedChartData: ProcessedDataItem[] = React.useMemo(() => 
    chartData.flatMap(yearData => 
      yearData.months.map(monthData => ({
        year: yearData.year,
        monthName: monthData.monthName,
        volume: monthData.volume,
        label: `${monthData.monthName} ${yearData.year}`
      }))
    ),
    [chartData]
  );

  // Sort data chronologically
  const sortedChartData = React.useMemo(() => 
    [...processedChartData].sort((a, b) => {
      const monthOrder: Record<string, number> = {
        "January": 0, "February": 1, "March": 2, "April": 3, 
        "May": 4, "June": 5, "July": 6, "August": 7, 
        "September": 8, "October": 9, "November": 10, "December": 11
      };
      
      if (a.year !== b.year) {
        return a.year - b.year;
      }
      return monthOrder[a.monthName] - monthOrder[b.monthName];
    }),
    [processedChartData]
  );

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const filteredData = React.useMemo(() => {
    let yearsToInclude;
    
    switch (timeRange) {
      case "past-1-year":
        yearsToInclude = 1;
        break;
      case "past-3-years":
        yearsToInclude = 3;
        break;
      case "past-5-years":
        yearsToInclude = 5;
        break;
      default:
        yearsToInclude = 1;
    }
    
    return sortedChartData.filter(item => {
      const itemDate = new Date(item.year, getMonthIndex(item.monthName));
      const cutoffDate = new Date(currentYear, currentMonth);
      cutoffDate.setFullYear(cutoffDate.getFullYear() - yearsToInclude);
      
      return itemDate >= cutoffDate;
    });
  }, [timeRange, sortedChartData, currentYear, currentMonth]);

  // const total = React.useMemo(
  //   () => ({
  //     count: filteredData.reduce((acc, curr) => acc + curr.volume, 0),
  //   }),
  //   [filteredData]
  // );

  // Calculate the maximum volume for proper scaling
  const maxVolume = React.useMemo(() => {
    if (filteredData.length === 0) return 1000;
    const max = Math.max(...filteredData.map(item => item.volume));
    // Add 10% padding to the top of the chart
    return Math.ceil(max * 1.1);
  }, [filteredData]);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <Card className="bg-background shadow-none border-0">
        <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
            <div className="flex items-center justify-between">
              <CardTitle>Total Workout Volume Per Month</CardTitle>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="past-1-year">Past 1 Year</SelectItem>
                  <SelectItem value="past-3-years">Past 3 Years</SelectItem>
                  <SelectItem value="past-5-years">Past 5 Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <CardDescription>
              Shows the total workout volume per month for the {
                timeRange === "past-1-year" ? "past year" : 
                timeRange === "past-3-years" ? "past 3 years" : 
                "past 5 years"
              }
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <LineChart
              accessibilityLayer
              data={filteredData}
              margin={{
                top: 20, // Add more top margin
                left: 12,
                right: 12,
                bottom: 8,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const [month, year] = value.split(' ');
                  return `${month.slice(0, 3)} ${year}`;
                }}
              />
              <YAxis 
                domain={[0, maxVolume]} // Set explicit domain with calculated max
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[150px]"
                    nameKey="views"
                    labelFormatter={(value) => value}
                  />
                }
              />
              <Line
                dataKey="volume" // Changed from "count" to "volume"
                type="natural"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to convert month name to index
function getMonthIndex(monthName: string): number {
  const months: Record<string, number> = {
    "January": 0, "February": 1, "March": 2, "April": 3, 
    "May": 4, "June": 5, "July": 6, "August": 7, 
    "September": 8, "October": 9, "November": 10, "December": 11
  };
  return months[monthName] || 0;
}