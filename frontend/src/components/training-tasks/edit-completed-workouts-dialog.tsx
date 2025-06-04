//edit-completed-workouts-dialog.tsx
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
import { EditCompletedWorkoutDialogProps } from '@/types/props';
import { CompletedWorkout } from '@/types/completed-workout';
import { toast } from "sonner";


// interface Exercise {
//   id: number;
//   actualId: number;
//   exerciseId: number;
//   plannedExerciseId: null;
//   actualSets: number | null;
//   actualReps: number | null;
//   actualWeight: number | null;
//   actualDuration: number | null;
//   exercise: {
//     id: number;
//     name: string;
//     category: string;
//     description: string;
//     createdAt: string;
//   };
//   plannedExercise: null;
// }





export function EditCompletedWorkoutDialog({
  workouts,
  workout,
  isOpen,
  onOpenChange,
  onSave,
}: EditCompletedWorkoutDialogProps) {

  
  const [formData, setFormData] = useState({
    title: "",
    completedDate: "",
    actualDuration: 0,
  });

  useEffect(() => {
    if (workout) {
      setFormData({
        title: workout.title,
        completedDate: workout.completedDate.split("T")[0],
        actualDuration: workout.actualDuration || 0,
      });
    }
  }, [workout]);

  if (!workout) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newDate = formData.completedDate.split('T')[0];

    // completed date cannot be in the future******
    const today = new Date();
    if (newDate > today.toISOString().split('T')[0]){
        toast.error("Completed date should not be in the future", {
            description: 'Please choose a new date',
        });
        return;
    } 

    const duplicatedDate = workouts.find(workout =>
        newDate === workout.completedDate.split('T')[0]
    );

    if (duplicatedDate) {
        toast.error(`${newDate} was already existed`, {
            description: 'Please choose a new date',
        });
        return;
    }
    
    const updatedWorkout: CompletedWorkout = {
      ...workout,
      title: formData.title,
      completedDate: formData.completedDate,
      actualDuration: formData.actualDuration,
    };

    await onSave(updatedWorkout);
    onOpenChange(false);
  };


  const handleInputChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === "actualDuration" ? Number(e.target.value) : e.target.value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Completed Workout</DialogTitle>
          <DialogDescription>
            Update your completed workout details below.
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
                value={formData.completedDate}
                onChange={handleInputChange("completedDate")}
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
                value={formData.actualDuration}
                onChange={handleInputChange("actualDuration")}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Exercises</Label>
              <div className="col-span-3 space-y-2 h-64 overflow-y-auto">

                {workout.actualExercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="flex items-center gap-2 p-2 bg-secondary rounded-lg"
                  >
                    <Dumbbell className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{exercise.exercise.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {exercise.actualSets && exercise.actualReps
                          ? `${exercise.actualSets} × ${exercise.actualReps} reps`
                          : exercise.actualDuration
                          ? `Duration: ${exercise.actualDuration} min`
                          : "No details specified"}
                        {exercise.actualWeight && ` @ ${exercise.actualWeight}kg`}
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