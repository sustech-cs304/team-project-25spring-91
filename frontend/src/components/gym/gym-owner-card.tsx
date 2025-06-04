import type { FC } from 'react';
import {
  Card,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import type { Gym } from '@/types/gym';
import { Button } from '@/components/ui/button';
import Image from 'next/image';


interface GymOwnerCardProps {
  gym: Gym;
  onEdit: () => void;
  onDelete: () => void;
}

const GymOwnerCard: FC<GymOwnerCardProps> = ({ gym, onEdit, onDelete }) => (
  <Card className="w-full border-0 shadow-none flex flex-col">
    <div className="aspect-square relative w-full overflow-hidden rounded-lg">
    {gym.imageUrl && (
        <Image
            src={gym.imageUrl}
            alt={gym.name}
            className="w-full h-48 object-cover rounded-xl"
        />
        )}

    </div>
    <CardContent className="px-0 pt-2 pb-0 space-y-1">
      <CardTitle className="text-sm truncate">{gym.name}</CardTitle>
      <CardDescription className="text-xs truncate">{gym.address}</CardDescription>
      <CardDescription className="text-xs line-clamp-1">{gym.description}</CardDescription>
    </CardContent>
    <CardFooter className="px-0 mt-2 gap-2">
      <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={onEdit}>
        Edit
      </Button>
      <Button variant="destructive" size="sm" className="flex-1 text-xs" onClick={onDelete}>
        Delete
      </Button>
    </CardFooter>
  </Card>
);

export default GymOwnerCard;
