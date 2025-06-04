// components/schedule-dialog.tsx
'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth-context';
import api from '@/lib/api';
import type {
  GymClass,
  ID,
  UserMembership,
  Schedule,
} from '@/types/gym';

interface ScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gymClass: GymClass;
}

export function ScheduleDialog({
  open,
  onOpenChange,
  gymClass,
}: ScheduleDialogProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [userMemberships, setUserMemberships] = useState<UserMembership[]>([]);
  const { user } = useAuth();


  useEffect(() => {
    if (open) {
      const fetchSchedules = async () => {
        try {
          setLoading(true);
          const response = await api.get<{ data: Schedule[] }>(
            `/classes/${gymClass.id}/schedules`
          );
          setSchedules(response.data.data);
        } catch (error) {
          console.error('Failed to fetch schedules:', error);
          toast.error('Failed to load schedules');
        } finally {
          setLoading(false);
        }
      };

      const fetchMemberships = async () => {
        try {
          setLoading(true);
          const response = await api.get<{ data: UserMembership[] }>(
            '/memberships/my-memberships'
          );
          setUserMemberships(response.data.data);
        } catch (error) {
          console.log('Failed to fetch memberships', error);
          toast.error('Failed to load memberships');
        } finally {
          setLoading(false);
        }
      };

      fetchSchedules();
      fetchMemberships();
    }
  }, [open, gymClass.id]);

  const findRelevantMembership = (): UserMembership | undefined => {
    if (!gymClass.gymId) {
      console.warn(
        'Gym ID is missing from gymClass, cannot find relevant membership.'
      );
      return undefined;
    }
    return userMemberships.find((m) => m.gymId === gymClass.gymId);
  };

  const handleBooking = async (scheduleId: ID) => {
    const relevantMembership = findRelevantMembership();

    if (!relevantMembership?.id) {
      toast.error(
        'No active membership found for this gym. Please ensure you have a valid membership.'
      );
      console.error(
        'Booking failed: Relevant membership ID is missing.'
      );
      return;
    }

    try {
      await api.post(`/bookings`, {
        scheduleId: scheduleId,
        membershipId: relevantMembership.id,
      });
      toast.success('Class booked successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Booking failed:', error);
      const errorMessage =
        (error as any).response?.data?.message || 'Failed to book class';
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{gymClass.name} - Available Sessions</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : schedules.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No schedules available at the moment.
            </p>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="rounded-lg border p-4 transition-colors hover:bg-accent/50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {format(new Date(schedule.startTime), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4" />
                          <span>
                            {format(new Date(schedule.startTime), 'h:mm a')} -{' '}
                            {format(new Date(schedule.endTime), 'h:mm a')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4" />
                          <span>{schedule.instructor}</span>
                        </div>
                      </div>
                      
                      {user?.role === 'user' && (
                        <Button
                          onClick={() => handleBooking(schedule.id)}
                          disabled={schedule.isFull || schedule.isCancelled}
                          variant={schedule.isFull ? "secondary" : "default"}
                        >
                          {schedule.isCancelled
                            ? 'Cancelled'
                            : schedule.isFull
                              ? 'Full'
                              : 'Book Now'}
                        </Button>
                      )}
                    </div>

                    {schedule.isCancelled && schedule.cancellationReason && (
                      <p className="mt-2 text-sm text-destructive">
                        Cancelled: {schedule.cancellationReason}
                      </p>
                    )}

                    <div className="mt-2 text-sm text-muted-foreground">
                      {schedule.spotsAvailable > 0 ? (
                        <span>{schedule.spotsAvailable} spots available</span>
                      ) : (
                        <span>Class is full</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}