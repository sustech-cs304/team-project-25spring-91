//edit-workouts-dialog.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, Dumbbell } from "lucide-react";
import { EditWorkoutDialogProps } from '@/types/props';
import { PlannedWorkout } from '@/types/workout';
import { toast } from "sonner";

// interface Exercise {
//   id: number;
//   exercise: {
//     name: string;
//     category: string;
//   };
//   plannedSets: number | null;
//   plannedReps: number | null;
//   plannedDuration: number | null;
// }



export function EditWorkoutDialog({
  workouts,
  workout,
  isOpen,
  onOpenChange,
  onSave,
}: EditWorkoutDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    scheduledDate: "",
    estimatedDuration: 0,
  });

  useEffect(() => {
    if (workout) {
      setFormData({
        title: workout.title,
        scheduledDate: workout.scheduledDate.split("T")[0],
        estimatedDuration: workout.estimatedDuration,
      });
    }
  }, [workout]);

  if (!workout) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newDate = formData.scheduledDate.split('T')[0];
    // planned date cannot be in the past
    const today = new Date();
    if (newDate < today.toISOString().split('T')[0]) {
      toast.error("Planned date should not be in the past", {
        description: 'Please choose a new date',
      });
      return;
    }

    const duplicatedDate = workouts.find(workout =>
      newDate === workout.scheduledDate.split('T')[0]
    );

    if (duplicatedDate) {
      toast.error(`${newDate} was already existed`, {
        description: 'Please choose a new date',
      });
      return;
    }

    const updatedWorkout: PlannedWorkout = {
      ...workout,
      title: formData.title,
      scheduledDate: formData.scheduledDate,
      estimatedDuration: formData.estimatedDuration,
    };

    await onSave(updatedWorkout);
    onOpenChange(false);
  };

  const handleInputChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === "estimatedDuration" ? Number(e.target.value) : e.target.value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Workout</DialogTitle>
          <DialogDescription>
            Update your workout details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={handleInputChange("title")}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                <Calendar className="h-4 w-4" />
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.scheduledDate}
                onChange={handleInputChange("scheduledDate")}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">
                <Clock className="h-4 w-4" />
              </Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={formData.estimatedDuration}
                onChange={handleInputChange("estimatedDuration")}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Exercises</Label>
              <div className="col-span-3 space-y-2 h-64 overflow-y-auto">

                {workout.plannedExercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="flex items-center gap-2 p-2 bg-secondary rounded-lg"
                  >
                    <Dumbbell className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{exercise.exercise.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {exercise.plannedSets && exercise.plannedReps
                          ? `${exercise.plannedSets} × ${exercise.plannedReps} reps`
                          : exercise.plannedDuration
                            ? `Duration: ${exercise.plannedDuration} min`
                            : "No details specified"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}