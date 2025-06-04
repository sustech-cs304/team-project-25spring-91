"use client";
import { AnnualLineChart } from "@/components/statistics/monthly-volume-chart";
import AnnualBarChart from "@/components/statistics/monthly-workout-completion-chart";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import api from "@/lib/api";
import ButterflyLoader from "@/components/butterfly-loader";
import axios from "axios";
import { useRoleProtection } from "@/hooks/use-role-protection";
import { UserRole } from "@/components/auth/sign-up-form";
import Link from "next/link";
import {
  MonthlyCaloriesChart,
  ChartDataPoint,
} from "@/components/statistics/monthly-calories-chart";

// Interface for API response data items for calories
interface MonthlyCalorieEntry {
  month: string; // "YYYY-MM"
  totalCalories: number;
}

// WorkoutStats interfaces
interface WorkoutStats {
  completedWorkoutSessions: number;
  currentMonthCompletionRate: number;
  workoutsByYear: YearlyWorkouts[];
  monthlyCompletedWorkouts: MonthlyWorkout[];
  longestStreak: number;
  currentStreak: number;
  bestRecords: {
    heaviestWeight: {
      weight: string;
      exercise: { id: number; name: string };
    };
    mostReps: { reps: number; exercise: { id: number; name: string } };
    mostSets: { sets: number; exercise: { id: number; name: string } };
  };
  volumeByYear: YearlyVolume[];
  monthlyVolume: MonthlyVolume[];
  topExercises: TopExercise[];
}

interface YearlyWorkouts {
  year: number;
  months: MonthlyWorkout[];
}

interface MonthlyWorkout {
  month: number;
  monthName: string;
  count: number;
}

interface YearlyVolume {
  year: number;
  months: MonthlyVolume[];
}

interface MonthlyVolume {
  month: number;
  monthName: string;
  volume: number;
}

interface TopExercise {
  id: number;
  name: string;
  category: string;
  count: number;
}

const StatsPage = () => {
  const [stats, setStats] = useState<WorkoutStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // State for MonthlyCaloriesChart data
  const [calorieChartData, setCalorieChartData] = useState<ChartDataPoint[]>(
    []
  );
  const [calorieChartLoading, setCalorieChartLoading] = useState(true);
  const [calorieChartError, setCalorieChartError] = useState<string | null>(
    null
  );

  const {
    isAuthorized,
    isLoading: authLoading,
    user,
  } = useRoleProtection({
    allowedRoles: [UserRole.REGULAR_USER],
  });

  useEffect(() => {
    const fetchPageData = async () => {
      // Fetch general stats
      setStatsLoading(true);
      try {
        const { data } = await api.get("/statistics/dashboard");
        setStats(data.data);
      } catch (error) {
        let errorMessage = "Failed to load dashboard statistics";
        if (
          axios.isAxiosError(error) &&
          error.response &&
          error.response.data
        ) {
          errorMessage = error.response.data.message || errorMessage;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        toast.error(errorMessage);
      } finally {
        setStatsLoading(false);
      }

      // Fetch monthly calorie data using the configured api instance
      setCalorieChartLoading(true);
      setCalorieChartError(null);
      try {
        const [intakeResponse, burnedResponse] = await Promise.all([
          api.get<{ data: MonthlyCalorieEntry[] }>(
            "/diet/monthly-calories-consumed"
          ),
          api.get<{ data: MonthlyCalorieEntry[] }>(
            "/actual-workouts/monthly-calories"
          ),
        ]);

        const intakeData = intakeResponse.data.data;
        const burnedData = burnedResponse.data.data;

        const allMonths = new Set<string>();
        intakeData.forEach((item) => allMonths.add(item.month));
        burnedData.forEach((item) => allMonths.add(item.month));

        const sortedMonths = Array.from(allMonths).sort(
          (a, b) =>
            new Date(a + "-01").getTime() - new Date(b + "-01").getTime()
        );

        const combinedData: ChartDataPoint[] = sortedMonths.map(
          (monthStr) => {
            const intakeEntry = intakeData.find((d) => d.month === monthStr);
            const burnedEntry = burnedData.find((d) => d.month === monthStr);
            return {
              month: monthStr,
              caloriesIntake: intakeEntry?.totalCalories ?? 0,
              caloriesBurned: burnedEntry?.totalCalories ?? 0,
            };
          }
        );
        setCalorieChartData(combinedData);
      } catch (err) {
        console.error("Failed to fetch calorie data:", err);
        let errorMessage = "Failed to load calorie data";
        if (
          axios.isAxiosError(err) &&
          err.response &&
          err.response.data &&
          typeof err.response.data.message === "string"
        ) {
          errorMessage = err.response.data.message;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }
        setCalorieChartError(errorMessage);
        toast.error(errorMessage);
        setCalorieChartData([]);
      } finally {
        setCalorieChartLoading(false);
      }
    };

    if (authLoading) {
      return;
    }

    if (isAuthorized) {
      fetchPageData();
    } else {
      setStatsLoading(false);
      setCalorieChartLoading(false);
    }
  }, [isAuthorized, authLoading]);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <ButterflyLoader />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center p-4">
        <h2 className="text-2xl font-semibold text-destructive mb-4">
          Access Denied
        </h2>
        <p className="text-muted-foreground mb-6">
          You do not have permission to view this page. Please log in or
          contact support if you believe this is an error.
        </p>
        <Link
          href="/auth/sign-in"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          Go to Sign In
        </Link>
      </div>
    );
  }

  if (statsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <ButterflyLoader />
      </div>
    );
  }

  // Prepare the data for components (records)
  const records = {
    heaviestLift: {
      name: stats?.bestRecords?.heaviestWeight?.exercise?.name || "No data",
      value: parseFloat(stats?.bestRecords?.heaviestWeight?.weight || "0"),
      unit: "kg",
      description: "Heaviest lift",
    },
    mostReps: {
      name: stats?.bestRecords?.mostReps?.exercise?.name || "No data",
      value: stats?.bestRecords?.mostReps?.reps || 0,
      unit: "rep",
      unitPlural: "reps",
      description: "Most reps",
    },
    longestStreak: {
      value: stats?.longestStreak || 0,
      unit: "week",
      unitPlural: "weeks",
      description: "Longest streak",
    },
    currentStreak: {
      value: stats?.currentStreak || 0,
      unit: "week",
      unitPlural: "weeks",
      description: "Current streak",
    },
    TotalCompletion: {
      value: stats?.completedWorkoutSessions || 0,
      unit: "Workout",
      unitPlural: "Workouts",
      description: "Total completion",
    },
    CompletionRate: {
      value: Math.round(stats?.currentMonthCompletionRate || 0),
      unit: "%",
      description: "Completion rate (Last 30 days)",
    },
    TopMostFrequentExercise: {
      name: stats?.topExercises?.[0]?.name || "No data",
      value: stats?.topExercises?.[0]?.count || 0,
      unit: "Time",
      unitPlural: "Times",
      description: "1st",
    },
    SecondMostFrequentExercise: {
      name: stats?.topExercises?.[1]?.name || "No data",
      value: stats?.topExercises?.[1]?.count || 0,
      unit: "Time",
      unitPlural: "Times",
      description: "2nd",
    },
    ThirdMostFrequentExercise: {
      name: stats?.topExercises?.[2]?.name || "No data",
      value: stats?.topExercises?.[2]?.count || 0,
      unit: "Time",
      unitPlural: "Times",
      description: "3rd",
    },
  };

  return (
    <div className="mx-4 my-4 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary">
          Welcome back, {user?.displayName}!
        </h1>
        <p className="text-lg text-muted-foreground">
          Track your fitness journey. Achieve your goals.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-xl p-6 h-full">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/dashboard/diet">
                <button className="w-full text-left p-3 hover:bg-muted rounded-md transition-colors text-sm">
                  Log meal
                </button>
              </Link>
              <Link href="/dashboard/completed-tasks">
                <button className="w-full text-left p-3 hover:bg-muted rounded-md transition-colors text-sm">
                  Log workout
                </button>
              </Link>
              <Link href="/dashboard/my-bookings">
                <button className="w-full text-left p-3 hover:bg-muted rounded-md transition-colors text-sm">
                  View bookings
                </button>
              </Link>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <MonthlyCaloriesChart
            chartData={calorieChartData}
            isLoading={calorieChartLoading}
            error={calorieChartError}
          />
        </div>
      </div>

      <div className="border-2 border-primary/20 bg-card p-4 sm:p-8 rounded-xl w-full max-w-5xl mx-auto text-center">
        <h2 className="text-xl sm:text-2xl font-semibold text-primary mb-4 sm:mb-6">
          Top 3 Most Frequently Scheduled Exercises
        </h2>
        <div className="flex flex-col sm:flex-row justify-around items-center gap-6 sm:gap-4">
          <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
            <div className="text-2xl sm:text-3xl font-medium text-primary/80">
              {records.TopMostFrequentExercise.name}
            </div>
            <div className="text-sm text-muted-foreground italic">
              {records.TopMostFrequentExercise.value}
              <span className="text-muted-foreground/80 ml-1">
                {records.TopMostFrequentExercise.unitPlural &&
                records.TopMostFrequentExercise.value !== 1
                  ? records.TopMostFrequentExercise.unitPlural
                  : records.TopMostFrequentExercise.unit}
              </span>
            </div>
          </div>
          <div className="hidden sm:block h-32 w-px bg-border border-1 border-primary/20"></div>
          <div className="w-1/2 h-px bg-border sm:hidden"></div>
          <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
            <div className="text-2xl sm:text-3xl font-medium text-primary/80">
              {records.SecondMostFrequentExercise.name}
            </div>
            <div className="text-sm text-muted-foreground italic">
              {records.SecondMostFrequentExercise.value}
              <span className="text-muted-foreground/80 ml-1">
                {records.SecondMostFrequentExercise.unitPlural &&
                records.SecondMostFrequentExercise.value !== 1
                  ? records.SecondMostFrequentExercise.unitPlural
                  : records.SecondMostFrequentExercise.unit}
              </span>
            </div>
          </div>
          <div className="hidden sm:block h-32 w-px bg-border border-1 border-primary/20"></div>
          <div className="w-1/2 h-px bg-border sm:hidden"></div>
          <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
            <div className="text-2xl sm:text-3xl font-medium text-primary/80">
              {records.ThirdMostFrequentExercise.name}
            </div>
            <div className="text-sm text-muted-foreground italic">
              {records.ThirdMostFrequentExercise.value}
              <span className="text-muted-foreground/80 ml-1">
                {records.ThirdMostFrequentExercise.unitPlural &&
                records.ThirdMostFrequentExercise.value !== 1
                  ? records.ThirdMostFrequentExercise.unitPlural
                  : records.ThirdMostFrequentExercise.unit}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <AnnualBarChart chartData={stats?.workoutsByYear || []} />
      </div>

      <div className="border-2 border-primary/20 bg-card p-4 sm:p-8 rounded-xl w-full max-w-5xl mx-auto text-center">
        <h2 className="text-xl sm:text-2xl font-semibold text-primary mb-4 sm:mb-6">
          Best Records
        </h2>
        <div className="flex flex-col sm:flex-row justify-around items-center gap-6 sm:gap-4">
          <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
            <div className="text-base sm:text-lg font-medium text-muted-foreground">
              {records.heaviestLift.name}
            </div>
            <div className="flex flex-wrap items-baseline text-2xl sm:text-3xl font-bold text-primary">
              {records.heaviestLift.value}
              <span className="text-lg sm:text-xl text-primary/80 ml-1">
                {records.heaviestLift.unit}
              </span>
            </div>
            <div className="text-sm text-muted-foreground italic">
              {records.heaviestLift.description}
            </div>
          </div>
          <div className="hidden sm:block h-32 w-px bg-border border-1 border-primary/20"></div>
          <div className="w-1/2 h-px bg-border sm:hidden"></div>
          <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
            <div className="text-base sm:text-lg font-medium text-muted-foreground">
              {records.mostReps.name}
            </div>
            <div className="flex flex-wrap items-baseline text-2xl sm:text-3xl font-bold text-primary">
              {records.mostReps.value}
              <span className="text-lg sm:text-xl text-primary/80 ml-1">
                {records.mostReps.unitPlural && records.mostReps.value !== 1
                  ? records.mostReps.unitPlural
                  : records.mostReps.unit}
              </span>
            </div>
            <div className="text-sm text-muted-foreground italic">
              {records.mostReps.description}
            </div>
          </div>
        </div>
      </div>

      <div>
        <AnnualLineChart chartData={stats?.volumeByYear || []} />
      </div>

      <div className="border-2 border-primary/20 bg-card p-4 sm:p-8 rounded-xl w-full max-w-5xl mx-auto text-center">
        <h2 className="text-xl sm:text-2xl font-semibold text-primary mb-4 sm:mb-6">
          Performance Metrics
        </h2>
        <div className="flex flex-col sm:flex-row justify-around items-center gap-6 sm:gap-4">
          <div className="flex flex-col items-center gap-2 w-full sm:w-auto ">
            <div className="flex flex-wrap items-baseline text-2xl sm:text-3xl font-bold text-primary">
              {records.longestStreak.value}
              <span className="text-lg sm:text-xl text-primary/80 ml-1">
                {records.longestStreak.value !== 1
                  ? records.longestStreak.unitPlural
                  : records.longestStreak.unit}
              </span>
            </div>
            <div className="text-sm text-muted-foreground italic">
              {records.longestStreak.description}
            </div>
          </div>
          <div className="hidden sm:block h-32 w-px bg-border border-1 border-primary/20"></div>
          <div className="w-1/2 h-px bg-border sm:hidden"></div>
          <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
            <div className="flex flex-wrap items-baseline text-2xl sm:text-3xl font-bold text-primary">
              {records.currentStreak.value}
              <span className="text-lg sm:text-xl text-primary/80 ml-1">
                {records.currentStreak.value !== 1
                  ? records.currentStreak.unitPlural
                  : records.currentStreak.unit}
              </span>
            </div>
            <div className="text-sm text-muted-foreground italic">
              {records.currentStreak.description}
            </div>
          </div>
          <div className="hidden sm:block h-32 w-px bg-border border-1 border-primary/20"></div>
          <div className="w-1/2 h-px bg-border sm:hidden"></div>
          <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
            <div className="flex flex-wrap items-baseline text-2xl sm:text-3xl font-bold text-primary">
              {records.TotalCompletion.value}
              <span className="text-lg sm:text-xl text-primary/80 ml-1">
                {records.TotalCompletion.value !== 1
                  ? records.TotalCompletion.unitPlural
                  : records.TotalCompletion.unit}
              </span>
            </div>
            <div className="text-sm text-muted-foreground italic">
              {records.TotalCompletion.description}
            </div>
          </div>
          <div className="hidden sm:block h-32 w-px bg-border border-1 border-primary/20"></div>
          <div className="w-1/2 h-px bg-border sm:hidden"></div>
          <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
            <div className="flex flex-wrap items-baseline text-2xl sm:text-3xl font-bold text-primary">
              {records.CompletionRate.value}
              <span className="text-lg sm:text-xl text-primary/80 ml-1">
                {records.CompletionRate.unit}
              </span>
            </div>
            <div className="text-sm text-muted-foreground italic">
              {records.CompletionRate.description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;