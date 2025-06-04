//page.tsx
"use client";
import React, { useEffect, useState } from 'react'
import { AddCompletedTaskSheet } from '@/components/training-tasks/add-completed-task-sheet';
import { toast } from 'sonner';
import { Calendar, Clock, Dumbbell, Edit, MoreVertical, Trash2 } from 'lucide-react';
import { EditCompletedWorkoutDialog } from '@/components/training-tasks/edit-completed-workouts-dialog';
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
import axios from 'axios';
import ButterflyLoader from '@/components/butterfly-loader';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CompletedWorkout } from '@/types/completed-workout';
import { useRoleProtection } from '@/hooks/use-role-protection';
import { UserRole } from '@/components/auth/sign-up-form';



const ITEMS_PER_PAGE = 10;

const CompletedWorkoutsPage = () => {
    const [workouts, setWorkouts] = useState<CompletedWorkout[]>([]);
    const [loading, setLoading] = useState(true);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedWorkout, setSelectedWorkout] = useState<CompletedWorkout | null>(null);
    const [expandedWorkouts, setExpandedWorkouts] = useState(new Set());
    const [currentPages, setCurrentPages] = useState({
        lastWeek: 1,
        past: 1
    });

    useEffect(() => {
        fetchCompletedWorkouts();
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
    const fetchCompletedWorkouts = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/actual-workouts');
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

    const handleAddCompletedTasks = async () => {
        await fetchCompletedWorkouts();
    };

    const handleDeleteGoal = async (id: number) => {
        try {
            setLoading(true);

            await api.delete(`/actual-workouts/${id}`);
            await fetchCompletedWorkouts();
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

    const handleEditGoal = async (workout: CompletedWorkout) => {
        try {


            const updatedData = {
                title: workout.title,
                completedDate: workout.completedDate,
                actualDuration: workout.actualDuration,
                actualExercises: workout.actualExercises
            }
            await api.put(`/actual-workouts/${workout.id}`, updatedData);

            await fetchCompletedWorkouts();

            toast.success('Workout updated successfully');
        } catch (error) {
            let errorMessage = 'Failed to update workouts';

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

    const groupWorkouts = (workouts: CompletedWorkout[]) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);

        return {
            today: workouts.filter(workout => {
                const workoutDate = new Date(workout.completedDate);
                workoutDate.setHours(0, 0, 0, 0);
                return workoutDate.getTime() === today.getTime();
            }),
            lastWeek: workouts.filter(workout => {
                const workoutDate = new Date(workout.completedDate);
                workoutDate.setHours(0, 0, 0, 0);
                return workoutDate.getTime() < today.getTime() &&
                    workoutDate.getTime() >= sevenDaysAgo.getTime();
            }),
            past: workouts.filter(workout => {
                const workoutDate = new Date(workout.completedDate);
                workoutDate.setHours(0, 0, 0, 0);
                return workoutDate.getTime() < sevenDaysAgo.getTime();
            })
        };
    };

    const paginateWorkouts = (workouts: CompletedWorkout[], page: number) => {
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

    const renderWorkout = (workout: CompletedWorkout) => (
        <li
            key={workout.id}
            className="
    bg-card text-card-foreground
    p-3
    rounded-lg
    border border-border/60
    hover:border-border/80 transition-colors
  "
        >
            <div className="flex flex-col gap-1.5">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                        <h3 className="font-medium text-base">{workout.title}</h3>
                        <div
                            className="
            inline-flex items-center h-5 px-2
            text-[10px] rounded-full
            border border-primary text-primary
            bg-accent
          "
                        >
                            Completed
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                                onClick={() => {
                                    setSelectedWorkout(workout)
                                    setEditDialogOpen(true)
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
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Workout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-3 text-muted-foreground text-xs">
                    <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>{new Date(workout.completedDate).toLocaleDateString()}</span>
                    </div>
                    {workout.actualDuration && (
                        <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{workout.actualDuration} min</span>
                        </div>
                    )}
                </div>

                {/* Exercises */}
                <div className="grid gap-0.5">
                    {(
                        expandedWorkouts.has(workout.id)
                            ? workout.actualExercises
                            : workout.actualExercises.slice(0, 1)
                    ).map((exercise) => (
                        <div
                            key={exercise.id}
                            className="flex items-center text-xs text-muted-foreground"
                        >
                            <Dumbbell className="w-3 h-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{exercise.exercise.name}</span>
                            {exercise.actualSets != null &&
                                exercise.actualReps != null && (
                                    <span className="ml-1 text-muted-foreground/80 flex-shrink-0">
                                        ({exercise.actualSets}×{exercise.actualReps})
                                    </span>
                                )}
                            {exercise.actualDuration != null && (
                                <span className="ml-1 text-muted-foreground/80 flex-shrink-0">
                                    ({exercise.actualDuration}m)
                                </span>
                            )}
                        </div>
                    ))}
                    {workout.actualExercises.length > 1 && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                toggleExpansion(workout.id);
                            }}
                            className="text-xs text-primary hover:underline focus:outline-none mt-0.5"
                        >
                            {expandedWorkouts.has(workout.id)
                                ? "Show less"
                                : `+${workout.actualExercises.length - 1} more exercises`}
                        </button>
                    )}
                </div>
            </div>
        </li>


    );

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
            {/* Dialogs */}
            <EditCompletedWorkoutDialog
                workouts={workouts}
                workout={selectedWorkout}
                isOpen={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                onSave={handleEditGoal}
            />
            <div className="flex justify-between items-center py-6">
                <h1 className="text-2xl font-bold">Completed Workouts</h1>
                <div className="w-auto">
                    <AddCompletedTaskSheet
                        propAddCompletedTasks={handleAddCompletedTasks}
                        workouts={workouts}
                    />
                </div>
            </div>

            {/* Main Content */}
            <div className="space-y-8">
                {workouts.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-lg text-muted-foreground mb-2">
                            No completed workouts yet.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Complete your first workout to see it here!
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Today */}
                        {groupedWorkouts.today.length > 0 && (
                            <div>
                                <h2 className="text-xl font-semibold mb-3">Today</h2>
                                <div className="ml-4">
                                    <section className="border-l-4 border-primary pl-4">
                                        <ul className="space-y-3">
                                            {groupedWorkouts.today.map(renderWorkout)}
                                        </ul>
                                    </section>
                                </div>
                            </div>
                        )}

                        {/* Last 7 Days */}
                        {groupedWorkouts.lastWeek.length > 0 && (
                            <div>
                                <h2 className="text-xl font-semibold mb-3">Last 7 Days</h2>
                                <div className="ml-4">
                                    <section className="border-l-4 border-primary pl-4">
                                        <ul className="space-y-3">
                                            {paginateWorkouts(
                                                groupedWorkouts.lastWeek,
                                                currentPages.lastWeek
                                            ).map(renderWorkout)}
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

                        {/* Past Workouts */}
                        {groupedWorkouts.past.length > 0 && (
                            <div>
                                <h2 className="text-xl font-semibold mb-3">Past Workouts</h2>
                                <div className="ml-4">
                                    <section className="border-l-4 border-primary pl-4">
                                        <ul className="space-y-3">
                                            {paginateWorkouts(
                                                groupedWorkouts.past,
                                                currentPages.past
                                            ).map(renderWorkout)}
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

export default CompletedWorkoutsPage;