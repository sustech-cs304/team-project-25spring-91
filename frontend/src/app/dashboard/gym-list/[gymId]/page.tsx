// app/dashboard/gym-list/[gymId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'sonner';
import type { Gym, GymClass } from '@/types/gym';
import { GymHeader } from '../../../../components/gym/gym-header';
import { ClassSection } from '../../../../components/gym/class-section';
import ButterflyLoader from '@/components/butterfly-loader';
import { useRoleProtection } from '@/hooks/use-role-protection';
import { UserRole } from '@/components/auth/sign-up-form';

interface ApiClassResponseItem {
  id: number;
  name: string;
  description: string;
  maxCapacity: number;
  durationMinutes: number;
  imageUrl: string;
  membersOnly: boolean;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  isActive: boolean;
  // gymId is assumed to be missing from this API response
}

export default function GymPage() {
  const params = useParams();
  const gymIdFromUrl = params.gymId as string;

  const [gym, setGym] = useState<Gym | null>(null);
  const [classes, setClasses] = useState<GymClass[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true); // Combined loading state

  useEffect(() => {
    const fetchGymData = async () => {
      if (!gymIdFromUrl) {
        toast.error('Gym ID is missing from URL.');
        setIsLoadingData(false);
        return;
      }

      setIsLoadingData(true);
      try {
        const gymPromise = api.get<{ data: Gym }>(`/gyms/${gymIdFromUrl}`);
        const classesPromise = api.get<{ data: ApiClassResponseItem[] }>(
          `/gyms/${gymIdFromUrl}/classes`
        );

        const [gymResponse, classesResponse] = await Promise.all([
          gymPromise,
          classesPromise,
        ]);

        setGym(gymResponse.data.data);

        const parsedGymId = parseInt(gymIdFromUrl, 10);
        if (isNaN(parsedGymId)) {
          console.error('Invalid gymId from URL:', gymIdFromUrl);
          toast.error('Invalid gym identifier.');
          setClasses([]);
          return; // Exit if gymId is invalid
        }

        const classesWithGymId: GymClass[] = classesResponse.data.data.map(
          (cls) => ({
            ...cls,
            gymId: parsedGymId, // Add the gymId from the URL
          })
        );
        setClasses(classesWithGymId);
      } catch (error) {
        console.error('Error fetching gym data:', error);
        toast.error('Failed to load gym details or classes.');
        setGym(null); // Clear gym data on error
        setClasses([]); // Clear classes on error
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchGymData();
  }, [gymIdFromUrl]);

  const { isAuthorized, isLoading: isAuthLoading } = useRoleProtection({
    allowedRoles: [UserRole.REGULAR_USER, UserRole.ADMIN, UserRole.GYM_OWNER],
  });

  if (isAuthLoading || isLoadingData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <ButterflyLoader />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <h2 className="text-2xl font-semibold mb-4">Access Denied</h2>
        <p className="text-muted-foreground">
          You do not have permission to view this page.
        </p>
      </div>
    );
  }

  if (!gym) {
    // If still no gym after loading and authorization, then it's a true notFound
    // or an error occurred during fetch which should have shown a toast.
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <GymHeader gym={gym} />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mt-8 space-y-8 pb-10">
          <ClassSection classes={classes} />
        </div>
      </main>
    </div>
  );
}