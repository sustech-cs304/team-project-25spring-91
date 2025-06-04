"use client";
import { SheetDemo } from '@/components/training-tasks/add-goal-sheet';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Calendar, CheckCircle, Clock, Dumbbell, Edit, MoreVertical, Trash2 } from 'lucide-react';
import { EditWorkoutDialog } from '@/components/training-tasks/edit-workouts-dialog';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import api from '@/lib/api';
import ButterflyLoader from '@/components/butterfly-loader';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { PlannedWorkout, WorkoutGroup } from '@/types/workout';
import { useRoleProtection } from '@/hooks/use-role-protection';
import { UserRole } from '@/components/auth/sign-up-form';


const ITEMS_PER_PAGE = 10;

const SetGoalPage = () => {
    const [workouts, setWorkouts] = useState<PlannedWorkout[]>([]);
    const [loading, setLoading] = useState(true);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedWorkout, setSelectedWorkout] = useState<PlannedWorkout | null>(null);
    const [expandedWorkouts, setExpandedWorkouts] = useState(new Set());
    const [currentPages, setCurrentPages] = useState({
        future: 1,
        lastWeek: 1,
        past: 1
    });
    useEffect(() => {
        fetchWorkouts();
    }, []);

    const { isAuthorized, isLoading } = useRoleProtection({
        allowedRoles: [UserRole.REGULAR_USER]
    });



    const toggleExpansion = (workoutId: number) => {
        setExpandedWorkouts((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(workoutId)) {
                newSet.delete(workoutId);
            } else {
                newSet.add(workoutId);
            }
            return newSet;
        });
    };
    const fetchWorkouts = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/planned-workouts');
            setWorkouts(data.data);
        } catch (error) {

            let errorMessage = 'Failed to load workouts';

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

    const handleAddGoal = async () => {
        await fetchWorkouts();
    };

    const handleDeleteGoal = async (id: number) => {
        try {
            setLoading(true);
            await api.delete(`/planned-workouts/${id}`);
            await fetchWorkouts();
            toast.success('Workout deleted successfully');
        } catch (error) {
            let errorMessage = 'Failed to delete workout';

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

    const handleEditGoal = async (workout: PlannedWorkout) => {
        try {
            setLoading(true);
            const updatedData = {
                title: workout.title,
                scheduledDate: workout.scheduledDate,
                estimatedDuration: workout.estimatedDuration,
                plannedExercises: workout.plannedExercises
            }
            await api.put(`/planned-workouts/${workout.id}`, updatedData);
            await fetchWorkouts();
            toast.success('Workout updated successfully');
        } catch (error) {

            let errorMessage = 'Failed to update workout';

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

    const markAsCompleted = async (workout: PlannedWorkout) => {
        try {
            setLoading(true);
            const today = new Date();

            if (workout.scheduledDate.split('T')[0] > today.toISOString().split('T')[0]) {
                toast.error("Cannot mark future plan as completed", {
                    description: 'Please choose the correct plan date',
                })
                return;
            }

            const updatedData = {
                title: workout.title,
                completedDate: workout.scheduledDate,
                actualDuration: workout.estimatedDuration,
                actualExercises: workout.plannedExercises
            }
            await api.post(`/actual-workouts/from-planned/${workout.id}`, updatedData);
            await fetchWorkouts();
            toast.success('Workout marked as completed');
        } catch (error) {

            let errorMessage = 'Failed to mark workout as completed';

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

    const groupWorkouts = (workouts: PlannedWorkout[]): WorkoutGroup => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);

        const groups = {
            future: [] as PlannedWorkout[],
            today: [] as PlannedWorkout[],
            lastWeek: [] as PlannedWorkout[],
            past: [] as PlannedWorkout[]
        };

        workouts.forEach(workout => {
            const workoutDate = new Date(workout.scheduledDate);
            workoutDate.setHours(0, 0, 0, 0);

            if (workoutDate.getTime() === today.getTime()) {
                groups.today.push(workout);
            } else if (workoutDate.getTime() > today.getTime()) {
                groups.future.push(workout);
            } else if (workoutDate.getTime() >= sevenDaysAgo.getTime()) {
                groups.lastWeek.push(workout);
            } else {
                groups.past.push(workout);
            }
        });

        return groups;
    };



    const paginateWorkouts = (workouts: PlannedWorkout[], page: number) => {
        const start = (page - 1) * ITEMS_PER_PAGE;
        return workouts.slice(start, start + ITEMS_PER_PAGE);
    };

    const renderPagination = (total: number, currentPage: number, section: keyof typeof currentPages) => {
        const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
        if (totalPages <= 1) return null;

        const renderPageNumbers = () => {
            const pages = [];
            const maxVisiblePages = 5; 

            let start = Math.max(1, currentPage - 2);
            const end = Math.min(totalPages, start + maxVisiblePages - 1);

            if (end === totalPages) {
                start = Math.max(1, end - maxVisiblePages + 1);
            }

            if (start > 1) {
                pages.push(
                    <PaginationItem key="1">
                        <PaginationLink
                            onClick={() => setCurrentPages(prev => ({ ...prev, [section]: 1 }))}
                            className="cursor-pointer"
                        >
                            1
                        </PaginationLink>
                    </PaginationItem>
                );
                if (start > 2) {
                    pages.push(
                        <PaginationItem key="ellipsis1">
                            <PaginationEllipsis />
                        </PaginationItem>
                    );
                }
            }

            for (let i = start; i <= end; i++) {
                pages.push(
                    <PaginationItem key={i}>
                        <PaginationLink
                            isActive={currentPage === i}
                            onClick={() => setCurrentPages(prev => ({ ...prev, [section]: i }))}
                            className="cursor-pointer"
                        >
                            {i}
                        </PaginationLink>
                    </PaginationItem>
                );
            }

            if (end < totalPages) {
                if (end < totalPages - 1) {
                    pages.push(
                        <PaginationItem key="ellipsis2">
                            <PaginationEllipsis />
                        </PaginationItem>
                    );
                }
                pages.push(
                    <PaginationItem key={totalPages}>
                        <PaginationLink
                            onClick={() => setCurrentPages(prev => ({ ...prev, [section]: totalPages }))}
                            className="cursor-pointer"
                        >
                            {totalPages}
                        </PaginationLink>
                    </PaginationItem>
                );
            }

            return pages;
        };

        return (
            <Pagination className="mt-4">
                <PaginationContent className="flex flex-wrap gap-1">
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => setCurrentPages(prev => ({
                                ...prev,
                                [section]: Math.max(1, prev[section] - 1)
                            }))}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                    </PaginationItem>

                    {renderPageNumbers()}

                    <PaginationItem>
                        <PaginationNext
                            onClick={() => setCurrentPages(prev => ({
                                ...prev,
                                [section]: Math.min(totalPages, prev[section] + 1)
                            }))}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        );
    };

    const renderWorkoutList = (workouts: PlannedWorkout[]) => {
        return workouts.map(workout => {

            return (
                <li
                    key={workout.id}
                    className="bg-card text-card-foreground p-3 rounded-lg border border-border/60 hover:border-border/80 transition-colors"
                >
                    <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                                <h3 className="font-medium text-base">{workout.title}</h3>
                                <div className="inline-flex items-center h-5 px-2 text-[10px] rounded-full border border-primary text-primary bg-accent">
                                    Planned
                                </div>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem onClick={() => markAsCompleted(workout)}>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Mark as Completed
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => {
                                            setSelectedWorkout(workout);
                                            setEditDialogOpen(true);
                                        }}
                                    >
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Workout
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        variant="destructive"
                                        onClick={() => handleDeleteGoal(workout.id)}
                                        aria-label="Delete workout"
                                        className="cursor-pointer"
                                    >
                                        <Trash2 className="mr-2 w-4 h-4" />
                                        Delete Workout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="flex items-center gap-3 text-muted-foreground text-xs">
                            <div className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                <span>{new Date(workout.scheduledDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                <span>{workout.estimatedDuration} min</span>
                            </div>
                        </div>

                        <div className="grid gap-0.5">
                            {(expandedWorkouts.has(workout.id)
                                ? workout.plannedExercises
                                : workout.plannedExercises.slice(0, 1)
                            ).map((exercise) => (
                                <div
                                    key={exercise.id}
                                    className="flex items-center text-xs text-muted-foreground"
                                >
                                    <Dumbbell className="w-3 h-3 mr-1 text-muted-foreground/70 flex-shrink-0" />
                                    <span className="truncate">{exercise.exercise.name}</span>
                                    {exercise.plannedSets && exercise.plannedReps && (
                                        <span className="ml-1 text-muted-foreground/80 flex-shrink-0">
                                            ({exercise.plannedSets}×{exercise.plannedReps})
                                        </span>
                                    )}
                                    {exercise.plannedDuration && (
                                        <span className="ml-1 text-muted-foreground/80 flex-shrink-0">
                                            ({exercise.plannedDuration}m)
                                        </span>
                                    )}
                                </div>
                            ))}
                            {workout.plannedExercises.length > 1 && (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        toggleExpansion(workout.id);
                                    }}
                                    className="text-xs text-primary hover:underline focus:outline-none mt-0.5"
                                >
                                    {expandedWorkouts.has(workout.id)
                                        ? "Show less"
                                        : `+${workout.plannedExercises.length - 1} more exercises`}
                                </button>
                            )}
                        </div>
                    </div>
                </li>




            );
        });
    };



    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <ButterflyLoader />
            </div>
        );
    }

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
    
    const groupedWorkouts = groupWorkouts(workouts);

    return (
        <div className="container mx-auto px-6">
            <EditWorkoutDialog
                workouts={workouts}
                workout={selectedWorkout}
                isOpen={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                onSave={handleEditGoal}
            />

            <div className="flex justify-between items-center py-6">
                <h1 className="text-2xl font-bold">Workout Planner</h1>
                <div className="w-auto">
                    <SheetDemo propAddGoal={handleAddGoal} workouts={workouts} />
                </div>
            </div>

            <div className="space-y-8"> 
                {workouts.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-lg text-muted-foreground mb-2">
                            No workouts planned yet
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Click the button above to add your first workout!
                        </p>
                    </div>
                ) : (
                    <>
                        {groupedWorkouts.today.length > 0 && (
                            <div>
                                <h2 className="text-xl font-semibold mb-3">Today</h2>
                                <div className="ml-4"> {/* Indent content */}
                                    <section className="border-l-4 border-primary pl-4">
                                        <ul className="space-y-3">
                                            {renderWorkoutList(groupedWorkouts.today)}
                                        </ul>
                                    </section>
                                </div>
                            </div>
                        )}

                        {groupedWorkouts.future.length > 0 && (
                            <div>
                                <h2 className="text-xl font-semibold mb-3">Upcoming Workouts</h2>
                                <div className="ml-4">
                                    <section className="border-l-4 border-primary pl-4">
                                        <ul className="space-y-3">
                                            {renderWorkoutList(
                                                paginateWorkouts(groupedWorkouts.future, currentPages.future)
                                            )}
                                        </ul>
                                        {renderPagination(
                                            groupedWorkouts.future.length,
                                            currentPages.future,
                                            "future"
                                        )}
                                    </section>
                                </div>
                            </div>
                        )}

                        {groupedWorkouts.lastWeek.length > 0 && (
                            <div>
                                <h2 className="text-xl font-semibold mb-3">Last 7 Days</h2>
                                <div className="ml-4">
                                    <section className="border-l-4 border-primary pl-4">
                                        <ul className="space-y-3">
                                            {renderWorkoutList(
                                                paginateWorkouts(groupedWorkouts.lastWeek, currentPages.lastWeek)
                                            )}
                                        </ul>
                                        {renderPagination(
                                            groupedWorkouts.lastWeek.length,
                                            currentPages.lastWeek,
                                            "lastWeek"
                                        )}
                                    </section>
                                </div>
                            </div>
                        )}

                        {groupedWorkouts.past.length > 0 && (
                            <div>
                                <h2 className="text-xl font-semibold mb-3">Past Workouts</h2>
                                <div className="ml-4">
                                    <section className="border-l-4 border-primary pl-4">
                                        <ul className="space-y-3">
                                            {renderWorkoutList(
                                                paginateWorkouts(groupedWorkouts.past, currentPages.past)
                                            )}
                                        </ul>
                                        {renderPagination(
                                            groupedWorkouts.past.length,
                                            currentPages.past,
                                            "past"
                                        )}
                                    </section>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>



    );
};

export default SetGoalPage;