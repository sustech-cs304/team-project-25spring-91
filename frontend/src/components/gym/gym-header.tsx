// app/(routes)/gyms/[gymId]/components/gym-header.tsx
"use client"

import { MapPin, Clock, Phone } from 'lucide-react'
import type { Gym } from '@/types/gym'

interface GymHeaderProps {
  gym: Gym
}

export function GymHeader({ gym }: GymHeaderProps) {
  return (
    <div className="relative w-full">
      <div className="relative h-[300px] w-full overflow-hidden">
        <img
          src={`${process.env.NEXT_PUBLIC_BACKEND_API_URL}${gym.imageUrl}`}
          alt={gym.name}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <div className="relative -mt-20 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-background p-6 shadow-lg">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-3xl font-bold">{gym.name}</h1>
              <p className="mt-2 text-muted-foreground">{gym.description}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{gym.address}</span>
              </div>

              {gym.contactInfo && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{gym.contactInfo}</span>
                </div>
              )}

              {gym._count && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {gym._count.classes} Classes Available
                  </span>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}