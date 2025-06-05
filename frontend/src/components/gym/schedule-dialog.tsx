// components/gym/schedule-dialog.tsx
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
import type { GymClass, ID, UserMembership, Schedule } from '@/types/gym';

interface ScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gymClass: GymClass; // gymClass should now reliably have gymId
}

export function ScheduleDialog({
  open,
  onOpenChange,
  gymClass,
}: ScheduleDialogProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [userMemberships, setUserMemberships] = useState<UserMembership[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (open && gymClass.id) {
      const fetchData = async () => {
        setIsLoadingData(true);
        try {
          const [schedulesResponse, membershipsResponse] = await Promise.all([
            api.get<{ data: Schedule[] }>(
              `/classes/${gymClass.id}/schedules`
            ),
            api.get<{ data: UserMembership[] }>(
              '/memberships/my-memberships'
            ),
          ]);
          setSchedules(schedulesResponse.data.data);
          setUserMemberships(membershipsResponse.data.data);
        } catch (error) {
          console.error('Failed to fetch schedules or memberships:', error);
          toast.error('Failed to load required data for booking.');
          setSchedules([]);
          setUserMemberships([]);
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchData();
    } else if (!open) {
      // Reset state when dialog closes
      setSchedules([]);
      setUserMemberships([]);
      setIsLoadingData(false);
      setIsBooking(false);
    }
  }, [open, gymClass.id]);

  const findRelevantMembership = (): UserMembership | undefined => {
    if (gymClass.gymId === undefined || gymClass.gymId === null) {
      console.warn(
        '[findRelevantMembership] Gym ID is missing from gymClass prop.',
        'gymClass received:',
        gymClass
      );
      return undefined;
    }

    const relevantMembership = userMemberships.find((membership) => {
      if (membership.gymId === undefined || membership.gymId === null) {
        return false;
      }
      const gymIdMatch = String(membership.gymId) === String(gymClass.gymId);
      const isActive = membership.status === 'active';
      return gymIdMatch && isActive;
    });

    return relevantMembership;
  };

  const handleBooking = async (scheduleId: ID) => {
    setIsBooking(true);
    const relevantMembership = findRelevantMembership();

    if (!relevantMembership?.id) {
      toast.error(
        'No active membership found for this gym. Please ensure you have a valid membership.'
      );
      console.error(
        'Booking failed: Relevant (active) membership ID is missing. Debug Info:',
        {
          'gymClass.id (for schedule fetch)': gymClass.id,
          'gymClass.gymId (for membership search)': gymClass.gymId,
          'Type of gymClass.gymId': typeof gymClass.gymId,
          'Result of findRelevantMembership was undefined':
            relevantMembership === undefined,
          'Number of userMemberships available': userMemberships.length,
          'User Memberships (first 3)': userMemberships.slice(0, 3),
        }
      );
      setIsBooking(false);
      return;
    }

    try {
      await api.post(`/bookings`, {
        scheduleId: scheduleId,
        membershipId: relevantMembership.id,
      });
      toast.success('Class booked successfully!');
      onOpenChange(false); // Close dialog on successful booking
    } catch (error) {
      console.error('Booking API call failed:', error);
      const errorMessage =
        (error as any).response?.data?.message ||
        'Failed to book class. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{gymClass.name} - Available Sessions</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {isLoadingData ? (
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
                            {format(
                              new Date(schedule.startTime),
                              'MMM dd, yyyy'
                            )}
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
                          <span>{schedule.instructor || 'N/A'}</span>
                        </div>
                      </div>

                      {user?.role === 'user' && (
                        <Button
                          onClick={() => handleBooking(schedule.id)}
                          disabled={
                            isBooking || // Disable if any booking is in progress
                            schedule.isFull ||
                            schedule.isCancelled
                          }
                          variant={schedule.isFull ? 'secondary' : 'default'}
                        >
                          {isBooking
                            ? 'Booking...'
                            : schedule.isCancelled
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
                      ) : !schedule.isCancelled ? (
                        <span>Class is full</span>
                      ) : null}
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