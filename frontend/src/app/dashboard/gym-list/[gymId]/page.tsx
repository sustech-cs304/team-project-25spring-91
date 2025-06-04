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

export default function GymPage() {
  const params = useParams();
  const gymId = params.gymId as string;

  const [gym, setGym] = useState<Gym | null>(null);
  const [classes, setClasses] = useState<GymClass[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchGymData = async () => {
      try {
        setLoading(true);
        const gymResponse = await api.get<{ data: Gym }>(`/gyms/${gymId}`);
        setGym(gymResponse.data.data);

        const classesResponse = await api.get<{ data: GymClass[] }>(`/gyms/${gymId}/classes`);
        setClasses(classesResponse.data.data);

      } catch (error) {
        console.error("Error details:", error);
        const errorMessage = "Failed to load gym details";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (gymId) {
      fetchGymData();
    }
  }, [gymId]);

  const { isAuthorized, isLoading } = useRoleProtection({
    allowedRoles: [UserRole.REGULAR_USER, UserRole.ADMIN, UserRole.GYM_OWNER]
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




  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <ButterflyLoader />
      </div>
    );
  }

  if (!gym) {
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