'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Clock, Users, ChevronRight, Dumbbell } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScheduleDialog } from '@/components/gym/schedule-dialog';
import type { GymClass } from '@/types/gym';

interface ClassCardProps {
  gymClass: GymClass;
}

export function ClassCard({ gymClass }: ClassCardProps) {
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const difficultyColor = {
    beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
  }[gymClass.difficultyLevel];

  return (
    <>
      <Card className="border-0 shadow-none group flex h-[500px] flex-col overflow-hidden transition-all duration-300 hover:shadow-lg">
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={`${process.env.NEXT_PUBLIC_BACKEND_API_URL}${gymClass.imageUrl}`}
            alt={gymClass.name}
            
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <Badge
            className={`absolute right-2 top-2 ${difficultyColor}`}
            variant="secondary"
          >
            {gymClass.difficultyLevel}
          </Badge>
        </div>

        <CardContent className="flex-1 p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold group-hover:text-primary transition-colors">
                {gymClass.name}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {gymClass.description}
              </p>
            </div>
            <Dumbbell className="h-5 w-5 text-muted-foreground/50" />
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{gymClass.durationMinutes} mins</span>
            </div>
            {gymClass.maxCapacity && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>Max {gymClass.maxCapacity}</span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="mt-auto p-4">
          <Button
            onClick={() => setScheduleOpen(true)}
            className="w-full group/button relative overflow-hidden"
          >
            <span className="flex items-center justify-center gap-2 transition-transform duration-300 group-hover/button:-translate-x-2">
              View Schedule
              <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover/button:translate-x-1" />
            </span>
          </Button>
        </CardFooter>
      </Card>

      <ScheduleDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        gymClass={gymClass}
      />
    </>
  );
}