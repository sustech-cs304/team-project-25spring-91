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
    Calendar,
    Users,
    Trophy,
    Target,
    Plus,
    Building2
} from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import api from '@/lib/api'
import { Gym } from '@/types/gym'
import { TasksDialog } from '@/components/gym/tasks-dialog'
import AddCompetitionForm from '@/components/gym/add-competition-form'
import EditCompetitionForm from '@/components/gym/edit-competition-form'

interface Competition {
    id: number
    gymId: number
    name: string
    description: string
    startDate: string
    endDate: string
    imageUrl?: string
    maxParticipants: number
    isActive: boolean
    createdAt: string
    gym?: {
        id: number
        name: string
    }
}

const CompetitionsPage = () => {
    const [competitions, setCompetitions] = useState<Competition[]>([])
    const [gyms, setGyms] = useState<Gym[]>([])
    const [selectedGymId, setSelectedGymId] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)
    const [showAddDialog, setShowAddDialog] = useState(false)
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [editingCompetition, setEditingCompetition] = useState<Competition | null>(null)

    useEffect(() => {
        fetchGyms()
    }, [])

    useEffect(() => {
        if (selectedGymId) {
            fetchCompetitions(selectedGymId)
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

    const fetchCompetitions = async (gymId: number) => {
        try {
            setLoading(true)
            
            const response = await api.get(`/competitions?gymId=${gymId}`)
            console.log('Competitions response:', response.data)
            
            let competitionsData: Competition[] = []
            
            if (response.data) {
                if (response.data.status === 'success' && response.data.data) {
                    competitionsData = response.data.data
                } else if (Array.isArray(response.data)) {
                    competitionsData = response.data
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    competitionsData = response.data.data
                }
            }
            
            setCompetitions(competitionsData)

        } catch (error) {
            console.error('Error fetching competitions:', error)
            toast.error('Failed to load competitions')
            setCompetitions([])
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteCompetition = async (competitionId: number) => {
        if (!confirm('Are you sure you want to delete this competition? This action cannot be undone.')) {
            return
        }

        try {
            await api.delete(`/competitions/${competitionId}`)
            toast.success('Competition deleted successfully')
            setCompetitions(prev => prev.filter(comp => comp.id !== competitionId))
        } catch (error) {
            console.error('Error deleting competition:', error)
            toast.error('Failed to delete competition')
        }
    }

    const handleUpdateCompetition = (competition: Competition) => {
        setEditingCompetition(competition)
        setShowEditDialog(true)
    }

    const handleAddCompetition = () => {
        setShowAddDialog(true)
    }

    const handleDialogClose = () => {
        setShowAddDialog(false)
        setShowEditDialog(false)
        setEditingCompetition(null)
        // Refresh competitions after adding/editing
        if (selectedGymId) {
            fetchCompetitions(selectedGymId)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const getCompetitionStatus = (startDate: string, endDate: string, isActive: boolean) => {
        if (!isActive) {
            return { status: 'inactive', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' }
        }

        const now = new Date()
        const start = new Date(startDate)
        const end = new Date(endDate)

        if (now < start) {
            return { status: 'upcoming', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' }
        } else if (now > end) {
            return { status: 'ended', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' }
        } else {
            return { status: 'active', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' }
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
                        Please create a gym first to manage competitions.
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
                    <h1 className="text-2xl font-bold">Competitions</h1>
                    <p className="text-muted-foreground">Manage competitions for your gyms</p>
                </div>
                {selectedGymId && (
                    <Button className='cursor-pointer' onClick={handleAddCompetition}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Competition
                    </Button>
                )}
            </div>

            {/* Gym Selector */}
            {gyms.length > 1 && (
                <div className="mb-6">
                    <label className="text-sm font-medium mb-2 block">Select Gym</label>
                    <Select value={selectedGymId?.toString()} onValueChange={(value) => setSelectedGymId(Number(value))}>
                        <SelectTrigger className="w-full max-w-md">
                            <SelectValue placeholder="Choose a gym to manage competitions" />
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
                    {competitions.length === 0 ? (
                        <div className="text-center py-12">
                            <Trophy className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-2 text-sm font-medium">No competitions</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Get started by creating your first competition for {selectedGym.name}.
                            </p>
                            <Button className="mt-4 cursor-pointer" onClick={handleAddCompetition}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Competition
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {competitions.map((competition) => {
                                const statusInfo = getCompetitionStatus(
                                    competition.startDate, 
                                    competition.endDate, 
                                    competition.isActive
                                )

                                return (
                                    <Card key={competition.id} className="border-0 shadow-none bg-card/50 backdrop-blur-sm h-[400px] flex flex-col">
                                        <CardContent className="p-0 flex flex-col h-full">
                                            {/* Image Section */}
                                            <div className="aspect-video relative overflow-hidden rounded-t-lg flex-shrink-0">
                                                {competition.imageUrl ? (
                                                    <img
                                                        src={`${process.env.NEXT_PUBLIC_BACKEND_API_URL}${competition.imageUrl}`}
                                                        alt={competition.name}
                                                        
                                                        className="object-cover"
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-muted/50 flex items-center justify-center">
                                                        <Trophy className="h-8 w-8 text-muted-foreground" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content Section */}
                                            <div className="p-4 flex flex-col flex-1">
                                                <div className="flex items-start justify-between gap-2 mb-3">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-semibold text-sm truncate">{competition.name}</h3>
                                                            <Badge className={`${statusInfo.color} text-xs shrink-0`}>
                                                                {statusInfo.status}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                                            {competition.description}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="space-y-2 text-xs text-muted-foreground mb-4 flex-1">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3 shrink-0" />
                                                        <span className="truncate">
                                                            {formatDate(competition.startDate)} - {formatDate(competition.endDate)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Users className="h-3 w-3 shrink-0" />
                                                        <span>Max {competition.maxParticipants} participants</span>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex gap-2 mt-auto">
                                                    <TasksDialog 
                                                        competitionId={competition.id} 
                                                        competitionName={competition.name}
                                                    >
                                                        <Button variant="outline" size="sm" className="flex-1 cursor-pointer">
                                                            <Target className="h-3 w-3 mr-1" />
                                                            Tasks
                                                        </Button>
                                                    </TasksDialog>
                                                    
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className='cursor-pointer'
                                                        onClick={() => handleUpdateCompetition(competition)}
                                                    >
                                                        <Edit className="h-3 w-3" />
                                                    </Button>
                                                    
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        className='cursor-pointer'
                                                        onClick={() => handleDeleteCompetition(competition.id)}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                </>
            ) : gyms.length > 1 ? (
                <div className="text-center py-12">
                    <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium">Select a gym</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Choose a gym from the dropdown above to view and manage its competitions.
                    </p>
                </div>
            ) : null}

            {/* Add Competition Dialog */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add New Competition</DialogTitle>
                    </DialogHeader>
                    {selectedGym && (
                        <AddCompetitionForm 
                            gym={selectedGym} 
                            onClose={handleDialogClose}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit Competition Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Competition</DialogTitle>
                    </DialogHeader>
                    {selectedGym && editingCompetition && (
                        <EditCompetitionForm 
                            gym={selectedGym} 
                            competition={editingCompetition}
                            onClose={handleDialogClose}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default CompetitionsPage
