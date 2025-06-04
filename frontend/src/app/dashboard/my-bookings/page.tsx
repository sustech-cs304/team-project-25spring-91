'use client';

import { useEffect, useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import {
  Calendar,
  Clock,
  Timer,
  Dumbbell,
  User,
  CreditCard,
} from 'lucide-react';
import api from '@/lib/api';
import { BookingCard } from '@/components/gym/booking-card';
import { MembershipCard } from '@/components/gym/gym-membership-card';
import ButterflyLoader from '@/components/butterfly-loader';
import { useRoleProtection } from '@/hooks/use-role-protection';
import { UserRole } from '@/components/auth/sign-up-form';
import { Booking, UserMembership } from '@/types/gym';

export default function BookingsAndMembershipsPage() {
  const [activeTab, setActiveTab] = useState('bookings');
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [memberships, setMemberships] = useState<UserMembership[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [bookingHistory, setBookingHistory] = useState<Booking[]>([]);

  const { isAuthorized, isLoading } = useRoleProtection({
    allowedRoles: [UserRole.REGULAR_USER]
  });



  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [bookingsRes, upcomingRes, historyRes, membershipsRes] =
        await Promise.all([
          api.get('/bookings/my-bookings'),
          api.get('/bookings/upcoming'),
          api.get('/bookings/history'),
          api.get('/memberships/my-memberships'),
        ]);

      setBookings(bookingsRes.data.data);
      setUpcomingBookings(upcomingRes.data.data);
      setBookingHistory(historyRes.data.data);
      setMemberships(membershipsRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBookingCancelSuccess = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const handleBookingAttendSuccess = useCallback(() => {
    fetchData(); 
  }, [fetchData]);

  const handleMembershipCancelSuccess = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const stats = {
    upcomingClasses: upcomingBookings.length,
    confirmedBookings: bookings.filter((b) => b.bookingStatus === 'confirmed')
      .length,
    activeMemberships: memberships.filter((m) => m.status === 'active').length,
  };


  // include cancelled status to booking history because backend only compare time
  // sort as well 
  const cancelledUpcomingBookings = bookings.filter(
    (booking) => booking.bookingStatus === 'cancelled',
  );
  const bookingHistoryToDisplay = [
    ...bookingHistory,
    ...cancelledUpcomingBookings,
  ].sort(
    (a, b) =>
      new Date(b.schedule.startTime).getTime() -
      new Date(a.schedule.startTime).getTime(),
  );



  if (loading && bookings.length === 0 && memberships.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <ButterflyLoader />
      </div>
    );
  }

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

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mt-8 space-y-8 pb-10">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-medium">Activity Overview</h1>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="border-none bg-accent/50">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background">
                    <Calendar className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Upcoming</p>
                    <p className="text-2xl font-medium">
                      {stats.upcomingClasses}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none bg-accent/50">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background">
                    <Dumbbell className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Confirmed Bookings
                    </p>
                    <p className="text-2xl font-medium">
                      {stats.confirmedBookings}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none bg-accent/50">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background">
                    <User className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Memberships
                    </p>
                    <p className="text-2xl font-medium">
                      {stats.activeMemberships}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Tabs
            defaultValue="bookings"
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <TabsList className="grid w-[400px] grid-cols-2">
                <TabsTrigger
                  value="bookings"
                  className="flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Bookings</span>
                  <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs">
                    {stats.confirmedBookings}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="memberships"
                  className="flex items-center gap-2"
                >
                  <Dumbbell className="h-4 w-4" />
                  <span>Memberships</span>
                  <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs">
                    {stats.activeMemberships}
                  </span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="bookings" className="space-y-6">
              <Tabs defaultValue="upcoming" className="space-y-4">
                <TabsList>
                  <TabsTrigger
                    value="upcoming"
                    className="flex items-center gap-2"
                  >
                    <Timer className="h-4 w-4" />
                    Upcoming
                  </TabsTrigger>
                  <TabsTrigger
                    value="history"
                    className="flex items-center gap-2"
                  >
                    <Clock className="h-4 w-4" />
                    History
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="space-y-4">
                  {upcomingBookings.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                        <Calendar className="h-8 w-8 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          No upcoming bookings
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {upcomingBookings.map((booking) =>
                        booking.bookingStatus !== 'cancelled' && (<BookingCard

                          key={booking.id}
                          booking={booking}
                          onCancelSuccess={handleBookingCancelSuccess}
                          onAttendSuccess={handleBookingAttendSuccess}
                        />
                        )

                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {bookingHistoryToDisplay.map((booking) => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        onAttendSuccess={handleBookingAttendSuccess}
                      />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="memberships" className="space-y-6">
              {memberships.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <CreditCard className="h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      No active memberships
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {memberships.map((membership) => (
                    <MembershipCard
                      key={membership.id}
                      membership={membership}
                      onCancelSuccess={handleMembershipCancelSuccess}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
