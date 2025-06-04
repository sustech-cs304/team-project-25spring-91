'use client';

import { format } from 'date-fns';
import { useState } from 'react';
import { 
  Building2,
  Calendar,
  CreditCard,
  Timer,
  XCircle,
  Dumbbell,
} from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import api from '@/lib/api';
import { MembershipStatus, UserMembership } from '@/types/gym';


const statusStyles: Record<MembershipStatus, string> = {
  active: 'bg-accent text-accent-foreground',
  cancelled: 'bg-destructive/10 text-destructive',
  expired: 'bg-muted text-muted-foreground',
};





interface MembershipCardProps {
  membership: UserMembership;
  onCancelSuccess?: () => void;
}

export function MembershipCard({ membership, onCancelSuccess }: MembershipCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handleCancelMembership = async () => {
    setIsLoading(true);
    try {
      await api.post(`/memberships/${membership.id}/cancel`);
      onCancelSuccess?.();
      setShowCancelDialog(false);
    } catch (error) {
      console.error('Error cancelling membership:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statusStyle = statusStyles[membership.status];
  const isActive = membership.status === 'active';
  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(membership.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )
  );

  return (
    <>
      <Card className="group relative overflow-hidden border bg-card transition-all hover:shadow-sm">
        <CardContent className="space-y-4 p-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{membership.gym.name}</h3>
                <Badge variant="secondary" className={statusStyle}>
                  {membership.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {membership.membershipPlan.name} Plan
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">
                ${membership.membershipPlan.price}
              </p>
              <p className="text-xs text-muted-foreground">
                per {membership.membershipPlan.durationDays} days
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Valid until {format(new Date(membership.endDate), 'MMM d, yyyy')}
              </span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Timer className="h-4 w-4" />
              <span>{daysLeft} days remaining</span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Dumbbell className="h-4 w-4" />
              <span>
                {membership.bookingsUsedThisWeek} / {membership.membershipPlan.maxBookingsPerWeek} bookings used this week
              </span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span className="truncate">{membership.gym.address}</span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              <span>
                Auto-renewal {membership.autoRenew ? 'enabled' : 'disabled'}
              </span>
            </div>
          </div>
        </CardContent>

        {isActive && (
          <CardFooter className="border-t bg-card/50 p-4">

            <Button
                  variant="outline"
                  size="sm"
                  className={`w-full text-xs text-destructive hover:bg-destructive/5`}
                  onClick={() => setShowCancelDialog(true)}
                  disabled={isLoading}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel Membership
                </Button>
          </CardFooter>
        )}
      </Card>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Membership</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your membership at{' '}
              <span className="font-medium">{membership.gym.name}</span>?
              This action cannot be undone and you may lose any remaining time on your membership.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Membership</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelMembership}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isLoading}
            >
              {isLoading ? 'Cancelling...' : 'Yes, Cancel Membership'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}