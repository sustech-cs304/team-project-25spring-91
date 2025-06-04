"use client"

import type { FC } from 'react'
import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import type { Gym } from '@/types/gym'
import { Button } from '@/components/ui/button'
import MembershipDialog from '@/components/gym/membership-dialog'


interface GymCardProps {
  gym: Gym
}

const GymCard: FC<GymCardProps> = ({ gym }) => {
  const router = useRouter();
  const [membershipOpen, setMembershipOpen] = useState(false)
  return (
    <>
      <Card className="w-full border-0 shadow-none flex flex-col">
        <div className="aspect-square relative w-full overflow-hidden rounded-lg">
          {gym.imageUrl && (
            <img
              // src={`http://localhost:5000${gym.imageUrl}`}
              src={
                gym.imageUrl.startsWith('http')
                  ? gym.imageUrl
                  : `http://localhost:5000${gym.imageUrl}`
              }
              alt={gym.name}
              
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
            />
          )}
        </div>
        <CardContent className="px-0 pt-2 pb-0 space-y-1">
          <CardTitle className="text-sm truncate">{gym.name}</CardTitle>
          <CardDescription className="text-xs truncate">{gym.address}</CardDescription>
          <CardDescription className="text-xs line-clamp-1">{gym.description}</CardDescription>
        </CardContent>
        <CardFooter className="px-0 mt-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs cursor-pointer"
            onClick={() => setMembershipOpen(true)}
          >
            Join
          </Button>
          <Button
            size="sm"
            className="flex-1 text-xs cursor-pointer"
            onClick={() => router.push(`/dashboard/gym-list/${gym.id}`)}
          >
            Book
          </Button>
        </CardFooter>
      </Card>

      <MembershipDialog
        gym={gym}
        open={membershipOpen}
        onOpenChange={setMembershipOpen}
      />
    </>
  )
}

export default GymCard