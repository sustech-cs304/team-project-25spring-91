// src/app/dashboard/dashboard/page.tsx
"use client";

import { useRoleProtection } from "@/hooks/use-role-protection";
import { UserRole } from "@/components/auth/sign-up-form";
import ButterflyLoader from "@/components/butterfly-loader";
import { StatsCard } from "@/components/dashboard/stats-card";
import { CalorieGoals } from "@/components/dashboard/calorie-goals";
import { WorkoutHeatmap } from "@/components/dashboard/workout-heatmap";
import Link from "next/link";

export default function DashboardPage() {
    const { isAuthorized, isLoading, user } = useRoleProtection({
        allowedRoles: [UserRole.REGULAR_USER]
      });

      if (isLoading) {
        return (
          <div className="flex justify-center items-center min-h-[200px]">
            <ButterflyLoader />
          </div>
        );
      }

      if (!isAuthorized) {
        return (
          <div className="flex justify-center items-center min-h-[200px]">
            <ButterflyLoader />
          </div>
        );
      }

    console.log('Rendering dashboard content');
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary">
            Welcome back, {user?.displayName}!
          </h1>
          <p className="text-lg text-muted-foreground">
            Track your fitness journey. Achieve your goals.
          </p>
        </div>

        {/* Stats Cards */}
        <StatsCard />

        {/* Quick Actions & Calorie Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/dashboard/diet">
                  <button className="w-full text-left p-2 hover:bg-muted rounded-md transition-colors">
                    Log meal
                  </button>
                </Link>

                <Link href="/dashboard/completed-tasks">
                  <button className="w-full text-left p-2 hover:bg-muted rounded-md transition-colors">
                    Log workout
                  </button>
                </Link>

                <Link href="/dashboard/my-bookings">
                  <button className="w-full text-left p-2 hover:bg-muted rounded-md transition-colors">
                    View bookings
                  </button>
                </Link>

                <Link href="/dashboard/leaderboard">
                  <button className="w-full text-left p-2 hover:bg-muted rounded-md transition-colors">
                    Check leaderboard
                  </button>
                </Link>

              </div>
            </div>
          </div>

          {/* Calorie Goals */}
          <div className="lg:col-span-2">
            <CalorieGoals />
          </div>
        </div>

        {/* Workout Heatmap */}
        <WorkoutHeatmap />
      </div>
    </div>
  );
}
