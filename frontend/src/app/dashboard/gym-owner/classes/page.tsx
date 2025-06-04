"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Edit,
    Trash2,
    Clock,
    Users,
    Dumbbell,
    Plus,
    Building2
} from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { Gym } from '@/types/gym'
import type { GymClass } from '@/types/gym'
import AddGymClassForm from '@/components/gym/add-gym-class-form'
import EditGymClassForm from '@/components/gym/edit-gym-class-form'

const ClassesPage = () => {
    const [classes, setClasses] = useState<GymClass[]>([])
    const [gyms, setGyms] = useState<Gym[]>([])
    const [selectedGymId, setSelectedGymId] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)
    const [showAddDialog, setShowAddDialog] = useState(false)
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [editingClass, setEditingClass] = useState<GymClass | null>(null)

    useEffect(() => {
        fetchGyms()
    }, [])

    useEffect(() => {
        if (selectedGymId) {
            fetchClasses(selectedGymId)
        }
    }, [selectedGymId])

    const fetchGyms = async () => {
        try {
            setLoading(true)
            const response = await api.get('/gyms/owned/my-gyms')
            console.log('Gyms response:', response.data)

            let gymsData: Gym[] = []

            if (response.data) {
                if (Array.isArray(response.data)) {
                    gymsData = response.data
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    gymsData = response.data.data
                } else if (response.data.id) {
                    gymsData = [response.data]
                } else if (response.data.data && response.data.data.id) {
                    gymsData = [response.data.data]
                }
            }

            setGyms(gymsData)
            
            // Auto-select first gym if only one exists
            if (gymsData.length === 1) {
                setSelectedGymId(gymsData[0].id)
            } else if (gymsData.length > 1) {
                // Let user choose which gym
                setSelectedGymId(null)
            }

        } catch (error) {
            console.error('Error fetching gyms:', error)
            toast.error('Failed to load gyms')
        } finally {
            setLoading(false)
        }
    }

    const fetchClasses = async (gymId: number) => {
        try {
            setLoading(true)
            
            // TODO: Replace with your actual API endpoint
            const response = await api.get(`/classes?gymId=${gymId}`)
            console.log('Classes response:', response.data)
            
            let classesData: GymClass[] = []
            
            if (response.data) {
                if (response.data.status === 'success' && response.data.data) {
                    classesData = response.data.data
                } else if (Array.isArray(response.data)) {
                    classesData = response.data
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    classesData = response.data.data
                }
            }
            
            setClasses(classesData)

        } catch (error) {
            console.error('Error fetching classes:', error)
            toast.error('Failed to load classes')
            setClasses([])
        } finally {
            setLoading(false)
        }
    }

const handleDeleteClass = async (classId: number) => {
    try {
        console.log('Deleting class with ID:', classId)
        console.log('API call URL:', `/classes/${classId}`)
        
        const response = await api.delete(`/classes/${classId}`)
        console.log('Delete response:', response.data)
        
        toast.success('Class deleted successfully')
        setClasses(prev => prev.filter(cls => cls.id !== classId))
    } catch (error) {
        console.error('Error deleting class:', error)
        toast.error('Failed to delete class')
    }
}

    const handleUpdateClass = (gymClass: GymClass) => {
        setEditingClass(gymClass)
        setShowEditDialog(true)
    }

    const handleAddClass = () => {
        setShowAddDialog(true)
    }

    const handleDialogClose = () => {
        setShowAddDialog(false)
        setShowEditDialog(false)
        setEditingClass(null)
        // Refresh classes after adding/editing
        if (selectedGymId) {
            fetchClasses(selectedGymId)
        }
    }

    const getDifficultyColor = (level: string) => {
        switch (level) {
            case 'beginner':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
            case 'intermediate':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
            case 'advanced':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
        }
    }

    const selectedGym = gyms.find(gym => gym.id === selectedGymId)

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-2 text-muted-foreground">Loading...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (gyms.length === 0) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium">No gyms found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Please create a gym first to manage classes.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Gym Classes</h1>
                    <p className="text-muted-foreground">Manage classes for your gyms</p>
                </div>
                {selectedGymId && (
                    <Button className='cursor-pointer' onClick={handleAddClass}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Class
                    </Button>
                )}
            </div>

            {/* Gym Selector */}
            {gyms.length > 1 && (
                <div className="mb-6">
                    <label className="text-sm font-medium mb-2 block">Select Gym</label>
                    <Select value={selectedGymId?.toString()} onValueChange={(value) => setSelectedGymId(Number(value))}>
                        <SelectTrigger className="w-full max-w-md">
                            <SelectValue placeholder="Choose a gym to manage classes" />
                        </SelectTrigger>
                        <SelectContent>
                            {gyms.map((gym) => (
                                <SelectItem key={gym.id} value={gym.id.toString()}>
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4" />
                                        <span>{gym.name}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Show content only when a gym is selected */}
            {selectedGymId && selectedGym ? (
                <>
                    {classes.length === 0 ? (
                        <div className="text-center py-12">
                            <Dumbbell className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-2 text-sm font-medium">No classes</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Get started by creating your first class for {selectedGym.name}.
                            </p>
                            <Button className="mt-4 cursor-pointer" onClick={handleAddClass}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Class
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 ">
                            {classes.map((gymClass) => (
                                <Card key={gymClass.id} className="border-0 shadow-none bg-card/50 backdrop-blur-sm h-[400px] flex flex-col mb-4 p-2">
                                    <CardContent className="p-0 flex flex-col h-full">
                                        {/* Image Section */}
                                        <div className="aspect-video relative overflow-hidden rounded-t-lg flex-shrink-0">
                                            {gymClass.imageUrl ? (
                                                <img
                                                    src={`${process.env.NEXT_PUBLIC_BACKEND_API_URL}${gymClass.imageUrl}`}
                                                    alt={gymClass.name}
                                                    className="object-cover"
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-muted/50 flex items-center justify-center">
                                                    <Dumbbell className="h-8 w-8 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Content Section */}
                                        <div className="p-4 flex flex-col flex-1">
                                            <div className="flex items-start justify-between gap-2 mb-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-semibold text-sm truncate">{gymClass.name}</h3>
                                                        <Badge className={`${getDifficultyColor(gymClass.difficultyLevel)} text-xs shrink-0`}>
                                                            {gymClass.difficultyLevel}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                                        {gymClass.description}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-2 text-xs text-muted-foreground mb-4 flex-1">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3 shrink-0" />
                                                    <span>{gymClass.durationMinutes} minutes</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-3 w-3 shrink-0" />
                                                    <span>Max {gymClass.maxCapacity} participants</span>
                                                </div>
                                                {gymClass.membersOnly && (
                                                    <div className="text-xs">
                                                        <Badge variant="outline" className="text-xs">
                                                            Members Only
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2 mt-auto">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className='cursor-pointer flex-1'
                                                    onClick={() => handleUpdateClass(gymClass)}
                                                >
                                                    <Edit className="h-3 w-3 mr-1" />
                                                    Edit
                                                </Button>
                                                
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className='cursor-pointer'
                                                    onClick={() => handleDeleteClass(gymClass.id)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </>
            ) : gyms.length > 1 ? (
                <div className="text-center py-12">
                    <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium">Select a gym</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Choose a gym from the dropdown above to view and manage its classes.
                    </p>
                </div>
            ) : null}

            {/* Add Class Dialog */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add New Class</DialogTitle>
                    </DialogHeader>
                    {selectedGym && (
                        <AddGymClassForm 
                            gym={selectedGym} 
                            onClose={handleDialogClose}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit Class Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Class</DialogTitle>
                    </DialogHeader>
                    {selectedGym && editingClass && (
                        <EditGymClassForm 
                            gym={selectedGym} 
                            gymClass={editingClass}
                            onClose={handleDialogClose}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default ClassesPage