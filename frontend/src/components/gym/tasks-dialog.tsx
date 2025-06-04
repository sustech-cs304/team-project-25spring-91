// components/tasks-dialog.tsx
"use client"

import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Target,
    Award,
    Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'

interface Task {
    id: number
    competitionId: number
    exerciseId: number
    name: string
    description: string
    targetValue: number
    unit: string
    pointsValue: number
    exercise: {
        id: number
        name: string
        category: string
    }
}

interface TasksDialogProps {
    competitionId: number
    competitionName: string
    children: React.ReactNode
}

export function TasksDialog({ competitionId, competitionName, children }: TasksDialogProps) {
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)

    const fetchTasks = async () => {
        try {
            setLoading(true)
            const response = await api.get(`/competitions/${competitionId}/tasks-list`)
            
            let tasksData = []
            if (response.data.status === 'success' && response.data.data) {
                tasksData = response.data.data
            }
            
            setTasks(tasksData)
        } catch (error) {
            console.error('Error fetching tasks:', error)
            toast.error('Failed to load tasks')
        } finally {
            setLoading(false)
        }
    }

    // const handleDeleteTask = async (taskId: number) => {
    //     if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
    //         return
    //     }

    //     try {
    //         await api.delete(`/competitions/tasks/${taskId}`)
    //         toast.success('Task deleted successfully')
    //         fetchTasks() // Refresh tasks
    //     } catch (error) {
    //         console.error('Error deleting task:', error)
    //         toast.error('Failed to delete task')
    //     }
    // }

    // const handleUpdateTask = (taskId: number) => {
    //     // TODO: Implement update task functionality
    //     console.log('Update task:', taskId)
    //     toast.info('Update task feature coming soon')
    // }

    // const handleAddTask = () => {
    //     // TODO: Implement add task functionality
    //     console.log('Add task to competition:', competitionId)
    //     toast.info('Add task feature coming soon')
    // }

    // Fetch tasks when dialog opens
    useEffect(() => {
        if (open) {
            fetchTasks()
        }
    }, [open])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-2xl h-[80vh] flex flex-col border-0 shadow-lg bg-background/95 backdrop-blur-sm">
                <DialogHeader className="flex-shrink-0 border-b pb-4">
                    <DialogTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Tasks for {competitionName}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex justify-between items-center flex-shrink-0 py-2">
                    <p className="text-sm text-muted-foreground">
                        {tasks.length} task{tasks.length !== 1 ? 's' : ''} total
                    </p>
                    {/* <Button onClick={handleAddTask} size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Task
                    </Button> */}
                </div>

                <div className="flex-1 min-h-0">
                    <ScrollArea className="h-full pr-4">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                <span className="text-sm text-muted-foreground">Loading tasks...</span>
                            </div>
                        ) : tasks.length > 0 ? (
                            <div className="space-y-3 pb-4">
                                {tasks.map((task) => (
                                    <div key={task.id} className="border-0 bg-card/50 backdrop-blur-sm rounded-lg p-4 space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                    <h4 className="font-medium">{task.name}</h4>
                                                    <Badge variant="secondary" className="text-xs">
                                                        {task.exercise?.name || 'Unknown Exercise'}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-xs">
                                                        {task.exercise?.category || 'Unknown Category'}
                                                    </Badge>
                                                </div>
                                                
                                                {task.description && (
                                                    <p className="text-sm text-muted-foreground mb-2">
                                                        {task.description}
                                                    </p>
                                                )}
                                                
                                                <div className="flex items-center gap-4 text-sm">
                                                    <div className="flex items-center gap-1">
                                                        <Target className="h-4 w-4 text-muted-foreground" />
                                                        <span>Target: <strong>{task.targetValue} {task.unit}</strong></span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Award className="h-4 w-4 text-muted-foreground" />
                                                        <span><strong>{task.pointsValue}</strong> points</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* <div className="flex gap-1 ml-4">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleUpdateTask(task.id)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteTask(task.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div> */}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-sm font-medium mb-2">No tasks yet</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Add your first task to get started with this competition.
                                </p>
                                {/* <Button onClick={handleAddTask} variant="outline">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Task
                                </Button> */}
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    )
}
