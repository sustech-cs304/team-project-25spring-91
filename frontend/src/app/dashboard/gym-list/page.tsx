'use client';

import { useEffect, useState } from 'react';
import type { Gym } from '@/types/gym';
import GymCard from '@/components/gym/gym-card';
import ButterflyLoader from '@/components/butterfly-loader';
import api from '@/lib/api';
import axios from 'axios';
import { toast } from 'sonner';
import { useRoleProtection } from '@/hooks/use-role-protection';
import { UserRole } from '@/components/auth/sign-up-form';

export default function GymsPage() {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGyms = async () => {
      try {
        const response = await api.get('/gyms/all/user-view');


        const formattedGyms = response.data.data.map((gym: Gym) => ({
          id: gym.id,
          name: gym.name,
          description: gym.description,
          contactInfo: gym.contactInfo,
          imageUrl: gym.imageUrl,
        }));
        setGyms(formattedGyms);


      } catch (error: unknown) {
        console.error("Error details:", error);

        let errorMessage = "Failed to load gyms";

        if (axios.isAxiosError(error) && error.response && error.response.data) {
          errorMessage = error.response.data.message || errorMessage;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchGyms();
  }, []);

  const { isAuthorized, isLoading } = useRoleProtection({
    allowedRoles: [UserRole.REGULAR_USER, UserRole.GYM_OWNER ,UserRole.ADMIN]

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

  return (
    <div className="
      p-4 sm:p-6 lg:p-8
      grid
      sm:grid-cols-2
      md:grid-cols-3
      lg:grid-cols-5
      xl:grid-cols-6
      gap-7
      [grid-template-columns:repeat(auto-fit,minmax(10rem,1fr))]
      max-w-full
      animate-fade-in
    ">
      {gyms.length > 0 ? (
        gyms.map((gym: Gym) => {

          return <GymCard key={gym.id} gym={gym} />;
        })
      ) : (
        <div className="col-span-full text-center py-10">
          <h3 className="text-lg font-medium">No gyms found</h3>
          <p className="text-muted-foreground mt-2">
            Please check your connection or try again later.
          </p>
        </div>
      )}

    </div>
  );
}