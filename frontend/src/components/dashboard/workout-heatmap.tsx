"use client";

import { useMemo } from "react";

interface WorkoutDay {
  date: string;
  count: number;
}

export function WorkoutHeatmap() {
  // Generate mock data for the last year
  const workoutData = useMemo(() => {
    const data: WorkoutDay[] = [];
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
      data.push({
        date: d.toISOString().split("T")[0],
        count: Math.random() < 0.5 ? 0 : 1, // 50% chance of workout
      });
    }
    return data;
  }, []);

  const getIntensityClass = (count: number) => {
    if (count === 0) return "bg-muted";
    return "bg-blue-600 dark:bg-blue-400";
  };

  const getWeeksArray = () => {
    const weeks: WorkoutDay[][] = [];
    let currentWeek: WorkoutDay[] = [];

    workoutData.forEach((day, index) => {
      const dayOfWeek = new Date(day.date).getDay();

      if (index === 0) {
        // Fill empty days at the beginning of the first week
        for (let i = 0; i < dayOfWeek; i++) {
          currentWeek.push({ date: "", count: 0 });
        }
      }

      currentWeek.push(day);

      if (dayOfWeek === 6 || index === workoutData.length - 1) {
        // End of week or last day
        if (index === workoutData.length - 1 && dayOfWeek !== 6) {
          // Fill empty days at the end of the last week
          for (let i = dayOfWeek + 1; i <= 6; i++) {
            currentWeek.push({ date: "", count: 0 });
          }
        }
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    return weeks;
  };

  const weeks = getWeeksArray();
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">
          Workouts in the last year
        </h3>
        <p className="text-sm text-muted-foreground">
          GitHub contribution style
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="flex mb-2">
            <div className="w-8"></div> 
            {months.map((month) => (
              <div
                key={month}
                className="text-xs text-muted-foreground"
                style={{
                  width: `${(weeks.length / 12) * 13}px`,
                  minWidth: "24px",
                }}
              >
                {month}
              </div>
            ))}
          </div>

          <div className="flex">
            <div className="flex flex-col mr-2">
              {days.map((day, index) => (
                <div
                  key={day}
                  className="h-3 flex items-center text-xs text-muted-foreground mb-1"
                >
                  {index % 2 === 1 ? day : ""}
                </div>
              ))}
            </div>

            <div className="flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day, dayIndex) => (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className={`w-3 h-3 rounded-sm ${getIntensityClass(
                        day.count
                      )} ${
                        day.date ? "cursor-pointer hover:ring-2 hover:ring-primary/50" : ""
                      }`}
                      title={
                        day.date
                          ? `${day.count} workouts on ${day.date}`
                          : ""
                      }
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              <div className={`w-3 h-3 rounded-sm ${getIntensityClass(0)}`} />
              <div className={`w-3 h-3 rounded-sm ${getIntensityClass(1)}`} />
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
