import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Gym, MembershipPlan } from '@/types/gym';
import { motion, AnimatePresence } from "framer-motion";
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth-context';
import api from '@/lib/api';

type StepNumber = 1 | 2;

interface MembershipDialogProps {
  gym: Gym;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const stepTitles: Record<StepNumber, string> = {
  1: "Choose Membership",
  2: "Confirmation"
};


const MembershipDialog: React.FC<MembershipDialogProps> = ({ gym, open, onOpenChange }) => {
  const { user } = useAuth(); 
  const [step, setStep] = React.useState<StepNumber>(1);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [membershipPlans, setMembershipPlans] = React.useState<MembershipPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = React.useState<MembershipPlan | null>(null);

  useEffect(() => {
    if (open) {
      handleFetchPlans();
    }
  }, [gym.id, open]);



  const handleNext = () => {
    if (!selectedPlan) return;
    if (step < 2) setStep((step + 1) as StepNumber);
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as StepNumber);
  };

  const handleFetchPlans = async () => {
    try {
      setLoading(true);
      const { data } = await api.get<{ data: MembershipPlan[] }>(`/gyms/${gym.id}/membership-plans`);
      setMembershipPlans(data.data);
    } catch (error) {
      console.error("Error details:", error);
      let errorMessage = "Failed to load membership plans";
      if (axios.isAxiosError(error) && error.response?.data) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
const handleSubscribe = async () => {
  if (!user) {
    toast.error('Please log in to subscribe');
    return;
  }

  try {
    setLoading(true);
    
    const { data } = await api.post('/stripe/create-checkout-session', {
      planId: selectedPlan?.id,
      gymId: gym.id,
      userEmail: user?.email,
      successUrl: `${window.location.origin}/dashboard/my-bookings`,
      cancelUrl: `${window.location.origin}/dashboard/my-bookings`,
    });

    if (data.url) {
      window.location.href = data.url;
    } else {
      toast.error('Failed to create checkout session');
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    toast.error('Failed to create checkout session');
  } finally {
    setLoading(false);
  }
};
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-h-[450px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-accent scrollbar-track-transparent"
          >
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">Loading plans...</div>
              </div>
            ) : membershipPlans.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <div className="text-6xl opacity-20">📋</div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-muted-foreground">
                      No Plans Available
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      This gym does not have any membership plans available at the
                      moment.
                    </p>
                  </div>
                </div>
              </div>
            ) :
              (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr">
                  {membershipPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`
                      rounded-lg border transition-all duration-300 ease-in-out
                      hover:shadow-lg hover:shadow-accent/5
                      ${selectedPlan?.id === plan.id
                          ? 'border-primary/50 bg-accent/5 shadow-lg shadow-accent/10'
                          : 'border-border/50 bg-card hover:border-accent/30'
                        }
                    `}
                    >
                      <div className="p-6 flex flex-col h-full">
                        <div className="mb-6">
                          <h3 className="text-xl font-semibold tracking-tight">{plan.name}</h3>
                          <div className="mt-3 flex items-baseline gap-1">
                            <span className="text-4xl font-bold tracking-tight">${plan.price}</span>
                            <span className="text-sm text-muted-foreground">
                              /{plan.durationDays} days
                            </span>
                          </div>
                        </div>

                        <div className="space-y-4 flex-1">
                          <div className="flex items-start gap-3">
                            <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-sm leading-relaxed">{plan.description}</span>
                          </div>
                          <div className="flex items-start gap-3">
                            <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-sm leading-relaxed">
                              Max {plan.maxBookingsPerWeek} bookings per week
                            </span>
                          </div>
                        </div>

                        <Button
                          variant={selectedPlan?.id === plan.id ? "default" : "outline"}
                          className={`
                          w-full mt-6 transition-all duration-300
                          ${selectedPlan?.id === plan.id
                              ? 'bg-primary text-primary-foreground shadow-md'
                              : 'hover:bg-accent/10'
                            }
                        `}
                          onClick={() => setSelectedPlan(plan)}
                        >
                          {selectedPlan?.id === plan.id ? "Selected" : "Select"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="h-[450px] flex items-center justify-center"
          >
            <div className="space-y-6 text-center">
              <div className="text-2xl font-semibold tracking-tight">
                {gym.name}
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground">You have selected the:</p>
                <p className="text-3xl font-bold tracking-tight">{selectedPlan?.name} Plan</p>
                <p className="mt-4 text-sm text-muted-foreground max-w-md mx-auto">
                  Please complete the payment by clicking the subscribe button below.
                </p>
              </div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] border-border/50">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            {gym.name} - {stepTitles[step]}
          </DialogTitle>
          <div className="h-1 w-full bg-accent rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 ease-in-out rounded-full"
              style={{ width: `${(step / 2) * 100}%` }}
            />
          </div>
        </DialogHeader>

        <div className="py-8">
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>
        </div>

        <DialogFooter>
          {step === 1 ? (
            <Button
              onClick={handleNext}
              disabled={!selectedPlan}
              className="min-w-[100px] transition-all duration-300"
            >
              Next
            </Button>
          ) : (
            <div className="flex w-full justify-between gap-4">
              <Button 
                variant="outline"
                onClick={handleBack}
                className="min-w-[100px] transition-all duration-300"
              >
                Back
              </Button>
              <Button
                onClick={handleSubscribe}

              className="min-w-[100px] transition-all duration-300"
              >
                {/* <Link href={`${'https://buy.stripe.com/test_bIY8wI4kQ4Ba9cQdQS'}?prefilled_email=${user?.email}`}>
                Subscribe
              </Link> */}
              Done
            </Button>
            </div>
          )}
      </DialogFooter>
    </DialogContent>
    </Dialog >
  );
};

export default MembershipDialog;
{/* <Link href={`${selectedPlan?.checkoutUrl}?prefilled_email=${user?.email}`}>
  Subscribe
</Link> */}