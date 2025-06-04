"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import type { Gym, GymClass } from '@/types/gym'
import PreviewDialog from './preview-dialog'
import { X, Upload, Plus, Trash2, Calendar, Clock, User } from 'lucide-react'
import api from '@/lib/api'

interface EditGymClassFormProps {
    gym: Gym
    gymClass: GymClass
    onClose: () => void
}

interface Schedule {
    id: string
    startTime: string
    endTime: string
    instructor: string
}

interface GymClassFormData {
    name: string
    description: string
    maxCapacity: string
    durationMinutes: string
    difficultyLevel: string
    membersOnly: boolean
}

const EditGymClassForm = ({ gym, gymClass, onClose }: EditGymClassFormProps) => {
    const [formData, setFormData] = useState<GymClassFormData>({
        name: gymClass.name || '',
        description: gymClass.description || '',
        maxCapacity: gymClass.maxCapacity?.toString() || '',
        durationMinutes: gymClass.durationMinutes?.toString() || '',
        difficultyLevel: gymClass.difficultyLevel || 'beginner',
        membersOnly: gymClass.membersOnly || false,
    })
    const [schedules, setSchedules] = useState<Schedule[]>([])
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string>(
        gymClass.imageUrl ? `http://localhost:5000${gymClass.imageUrl}` : ''
    )
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showPreview, setShowPreview] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchSchedules()
    }, [gymClass.id])

    const fetchSchedules = async () => {
        try {
            setLoading(true)
            const response = await api.get<{ data: Schedule[] }>(
                `/classes/${gymClass.id}/schedules`
            )
            
            const formattedSchedules = response.data.data.map((schedule: any) => ({
                id: schedule.id?.toString(), 
                startTime: schedule.startTime ? new Date(schedule.startTime).toISOString().slice(0, 16) : '',
                endTime: schedule.endTime ? new Date(schedule.endTime).toISOString().slice(0, 16) : '',
                instructor: schedule.instructor || '',
            }))

            setSchedules(formattedSchedules)
        } catch (error) {
            console.error('Error fetching schedules:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const removeImage = () => {
        setImageFile(null)
        setImagePreview('')
    }

    const addSchedule = () => {
        const newSchedule: Schedule = {
            id: `new_${Date.now()}`, // Mark new schedules with "new_" prefix
            startTime: '',
            endTime: '',
            instructor: '',
        }
        setSchedules([...schedules, newSchedule])
    }

    // Check if schedule is existing (numeric ID) or new (has "new_" prefix)
    const isExistingSchedule = (scheduleId: string) => {
        return /^\d+$/.test(scheduleId) // Returns true if ID is purely numeric
    }

    // Handle remove/delete based on whether schedule is existing or new
    const handleScheduleRemove = async (scheduleId: string) => {
        if (isExistingSchedule(scheduleId)) {
            // Delete from database for existing schedules
            try {
                await api.delete(`/classes/schedules/${scheduleId}`)
                toast.success('Schedule deleted successfully')
                // Remove from local state after successful deletion
                setSchedules(schedules.filter((schedule) => schedule.id !== scheduleId))
            } catch (error) {
                console.error('Error deleting schedule:', error)
                toast.error('Failed to delete schedule')
                // Don't remove from local state if deletion failed
            }
        } else {
            // Just remove from local state for new schedules
            setSchedules(schedules.filter((schedule) => schedule.id !== scheduleId))
        }
    }

    const updateSchedule = (id: string, field: keyof Schedule, value: string) => {
        setSchedules(
            schedules.map((schedule) =>
                schedule.id === id ? { ...schedule, [field]: value } : schedule
            )
        )
    }

    const formatDateTime = (dateTimeString: string) => {
        if (!dateTimeString) return 'Not set'
        const date = new Date(dateTimeString)
        return date.toLocaleString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const validateSchedules = () => {
        const newSchedules = schedules.filter(schedule => !isExistingSchedule(schedule.id))
        
        for (const schedule of newSchedules) {
            if (!schedule.startTime || !schedule.endTime) {
                toast.error('Please fill in all schedule times for new schedules')
                return false
            }
            
            const startDate = new Date(schedule.startTime)
            const endDate = new Date(schedule.endTime)
            
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                toast.error('Invalid date format in schedules')
                return false
            }
            
            if (startDate >= endDate) {
                toast.error('End time must be after start time')
                return false
            }
        }
        return true
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)

        // Validate schedules before proceeding
        if (schedules.length > 0 && !validateSchedules()) {
            setIsSubmitting(false)
            return
        }

        try {
            const classData = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                maxCapacity: parseInt(formData.maxCapacity),
                durationMinutes: parseInt(formData.durationMinutes),
                difficultyLevel: formData.difficultyLevel,
                membersOnly: formData.membersOnly,
                gymId: gym.id,
            }

            // Update class data
            await api.put(`/classes/${gymClass.id}`, classData, {
                headers: { 'Content-Type': 'application/json' },
            })

            // Handle image upload if new image is selected
            if (imageFile) {
                const imageFormData = new FormData()
                imageFormData.append('name', formData.name.trim())
                imageFormData.append('image', imageFile)

                try {
                    await api.put(`/classes/${gymClass.id}`, imageFormData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    })
                    console.log('Image updated successfully')
                } catch (imageError) {
                    console.warn('Image update failed:', imageError)
                    toast.warning('Class updated but image upload failed')
                }
            }

            // Handle NEW schedules only (existing ones are already handled individually)
            const newSchedules = schedules.filter(schedule => !isExistingSchedule(schedule.id))
            
            if (newSchedules.length > 0) {
                const validNewSchedules = newSchedules.filter((schedule) => {
                    if (!schedule.startTime || !schedule.endTime) return false
                    const startDate = new Date(schedule.startTime)
                    const endDate = new Date(schedule.endTime)
                    return !isNaN(startDate.getTime()) && !isNaN(endDate.getTime())
                })

                if (validNewSchedules.length > 0) {
                    const schedulePromises = validNewSchedules.map((schedule) =>
                        api.post(`/classes/${gymClass.id}/schedules`, {
                            startTime: new Date(schedule.startTime).toISOString(),
                            endTime: new Date(schedule.endTime).toISOString(),
                            instructor: schedule.instructor,
                        })
                    )
                    await Promise.all(schedulePromises)
                }
            }

            toast.success('Class updated successfully!')
            onClose()
        } catch (error: any) {
            console.error('Error updating class:', error)
            if (error.response?.data?.error && Array.isArray(error.response.data.error)) {
                const errorMessages = error.response.data.error.map((err: any) => err.message).join(', ')
                toast.error(`Validation error: ${errorMessages}`)
            } else {
                toast.error(error.response?.data?.message || 'Failed to update class. Please try again.')
            }
        } finally {
            setIsSubmitting(false)
            setShowPreview(false)
        }
    }

    const previewData = {
        ...formData,
        schedules,
        imagePreview,
        gymName: gym.name,
    }

    // Separate existing and new schedules
    const existingSchedules = schedules.filter(schedule => isExistingSchedule(schedule.id))
    const newSchedules = schedules.filter(schedule => !isExistingSchedule(schedule.id))

    return (
        <>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Class Name</Label>
                        <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Yoga Class"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="maxCapacity">Max Capacity</Label>
                        <Input
                            id="maxCapacity"
                            name="maxCapacity"
                            type="number"
                            value={formData.maxCapacity}
                            onChange={handleInputChange}
                            placeholder="20"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="durationMinutes">Duration (minutes)</Label>
                        <Input
                            id="durationMinutes"
                            name="durationMinutes"
                            type="number"
                            value={formData.durationMinutes}
                            onChange={handleInputChange}
                            placeholder="60"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="difficultyLevel">Difficulty Level</Label>
                        <Select
                            value={formData.difficultyLevel}
                            onValueChange={(value) =>
                                setFormData((prev) => ({ ...prev, difficultyLevel: value }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="beginner">Beginner</SelectItem>
                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                <SelectItem value="advanced">Advanced</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Describe the class..."
                        rows={3}
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="membersOnly"
                        checked={formData.membersOnly}
                        onCheckedChange={(checked) =>
                            setFormData((prev) => ({ ...prev, membersOnly: !!checked }))
                        }
                    />
                    <Label htmlFor="membersOnly">Members Only</Label>
                </div>

                <div className="space-y-2">
                    <Label>Class Image</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                        {imagePreview ? (
                            <div className="relative">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-32 object-cover rounded"
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="absolute top-2 right-2"
                                    onClick={removeImage}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center">
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="mt-2">
                                    <Label htmlFor="image" className="cursor-pointer">
                                        <span className="text-sm text-blue-600 hover:text-blue-500">
                                            Upload an image
                                        </span>
                                        <Input
                                            id="image"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </Label>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label>Class Schedules</Label>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addSchedule}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Schedule
                        </Button>
                    </div>

                    {loading ? (
                        <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                            <p className="mt-2 text-sm text-muted-foreground">Loading schedules...</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Existing Schedules - Read Only */}
                            {existingSchedules.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-medium text-muted-foreground">
                                        Current Schedules (Read Only)
                                    </h4>
                                    {existingSchedules.map((schedule) => (
                                        <div
                                            key={schedule.id}
                                            className="p-4 border rounded-lg bg-muted/30"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-2 flex-1">
                                                    <div className="flex items-center gap-4 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                                            <span className="font-medium">Start:</span>
                                                            <span>{formatDateTime(schedule.startTime)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                                            <span className="font-medium">End:</span>
                                                            <span>{formatDateTime(schedule.endTime)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-medium">Instructor:</span>
                                                        <span>{schedule.instructor || 'Not assigned'}</span>
                                                    </div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleScheduleRemove(schedule.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* New Schedules - Editable */}
                            {newSchedules.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-medium text-muted-foreground">
                                        New Schedules
                                    </h4>
                                    {newSchedules.map((schedule) => (
                                        <div
                                            key={schedule.id}
                                            className="p-4 border rounded-lg space-y-3 bg-background"
                                        >
                                            {/* Row 1: Time inputs */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">Start Time</Label>
                                                    <Input
                                                        type="datetime-local"
                                                        value={schedule.startTime}
                                                        onChange={(e) =>
                                                            updateSchedule(schedule.id, 'startTime', e.target.value)
                                                        }
                                                        className="w-full"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">End Time</Label>
                                                    <Input
                                                        type="datetime-local"
                                                        value={schedule.endTime}
                                                        onChange={(e) =>
                                                            updateSchedule(schedule.id, 'endTime', e.target.value)
                                                        }
                                                        className="w-full"
                                                    />
                                                </div>
                                            </div>
                                            
                                            {/* Row 2: Instructor and actions */}
                                            <div className="flex items-end gap-4">
                                                <div className="flex-1 space-y-2">
                                                    <Label className="text-sm font-medium">Instructor</Label>
                                                    <Input
                                                        value={schedule.instructor}
                                                        onChange={(e) =>
                                                            updateSchedule(schedule.id, 'instructor', e.target.value)
                                                        }
                                                        placeholder="John Smith"
                                                        className="w-full"
                                                    />
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleScheduleRemove(schedule.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {schedules.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Calendar className="mx-auto h-12 w-12 mb-2" />
                                    <p>No schedules yet. Add your first schedule above.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex gap-2 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowPreview(true)}
                        className="flex-1"
                    >
                        Preview
                    </Button>
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                </div>
            </div>

            <PreviewDialog
                open={showPreview}
                onOpenChange={setShowPreview}
                title="Updated Gym Class Preview"
                data={previewData}
                onConfirm={handleSubmit}
                isSubmitting={isSubmitting}
            />
        </>
    )
}

export default EditGymClassForm