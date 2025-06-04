// components/edit-competition-form.tsx
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import type { Gym } from '@/types/gym'
import PreviewDialog from './preview-dialog'
import { X, Upload, Plus, Edit, Trash2 } from 'lucide-react'
import api from '@/lib/api'
import { ExerciseOption } from '@/types/exercise'

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
}

interface EditCompetitionFormProps {
  gym: Gym
  competition: Competition
  onClose: () => void
}

interface CompetitionFormData {
  name: string
  description: string
  startDate: string
  endDate: string
  maxParticipants: string
}

interface TaskFormData {
  id?: number
  name: string
  description: string
  exerciseId: string
  exerciseName?: string
  exerciseCategory?: string
  targetValue: string
  unit: string
  metric: string
  pointsValue: string
}

// Define metrics and units based on exercise categories
const EXERCISE_METRICS = {
  strength: ['Weight', 'Repetition'],
  cardio: ['Distance', 'Duration'],
  flexibility: ['Duration', 'Repetition'],
  balance: ['Duration', 'Repetition'],
  core: ['Duration', 'Repetition'],
}

const METRIC_UNITS = {
  Weight: ['kg', 'lbs'],
  Repetition: ['reps'],
  Distance: ['meters', 'kilometers', 'miles'],
  Duration: ['seconds', 'minutes', 'hours'],
}

const EditCompetitionForm = ({ gym, competition, onClose }: EditCompetitionFormProps) => {
  const [formData, setFormData] = useState<CompetitionFormData>({
    name: competition.name,
    description: competition.description,
    startDate: new Date(competition.startDate).toISOString().slice(0, 16),
    endDate: new Date(competition.endDate).toISOString().slice(0, 16),
    maxParticipants: competition.maxParticipants.toString(),
  })

  const [tasks, setTasks] = useState<TaskFormData[]>([])
  const [exerciseOptions, setExerciseOptions] = useState<ExerciseOption[]>([])
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [editingTaskIndex, setEditingTaskIndex] = useState<number | null>(null)
  const [currentTask, setCurrentTask] = useState<TaskFormData>({
    name: '',
    description: '',
    exerciseId: '',
    targetValue: '',
    unit: '',
    metric: '',
    pointsValue: '',
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>(competition.imageUrl || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // Fetch exercises and tasks when component mounts
  useEffect(() => {
    fetchExercises()
    fetchTasks()
  }, [])

  const fetchExercises = async () => {
    try {
      const { data } = await api.get('exercises')
      setExerciseOptions(data.data)
    } catch (error) {
      console.error('Error fetching exercises:', error)
      // Fallback to mock data if API fails
      const mockData = [
        { id: 1, name: 'Deadlift', category: 'strength' },
        { id: 2, name: 'Bench Press', category: 'strength' },
        { id: 3, name: 'Squat', category: 'strength' },
        { id: 4, name: 'Pull-up', category: 'strength' },
        { id: 5, name: 'Push-up', category: 'strength' },
        { id: 6, name: 'Running', category: 'cardio' },
        { id: 7, name: 'Cycling', category: 'cardio' },
        { id: 8, name: 'Swimming', category: 'cardio' },
        { id: 9, name: 'Plank', category: 'core' },
        { id: 10, name: 'Hamstring Stretch', category: 'flexibility' },
      ]
      setExerciseOptions(mockData)
      toast.warning('Could not fetch exercises from API, using fallback data.')
    }
  }

  const fetchTasks = async () => {
    try {
      const response = await api.get(`/competitions/${competition.id}/tasks-list`)

      let tasksData = []
      if (response.data.status === 'success' && response.data.data) {
        tasksData = response.data.data.map((task: any) => ({
          id: task.id,
          name: task.name,
          description: task.description,
          exerciseId: task.exerciseId.toString(),
          exerciseName: task.exercise?.name || '',
          exerciseCategory: task.exercise?.category || '',
          targetValue: task.targetValue.toString(),
          unit: task.unit,
          pointsValue: task.pointsValue.toString(),
        }))
      }

      setTasks(tasksData)
    } catch (error) {
      console.error('Error fetching tasks:', error)
      toast.error('Failed to load tasks')
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

  const handleTaskInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setCurrentTask((prev) => ({
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

  const handleExerciseSelect = (exerciseId: string) => {
    const selectedExercise = exerciseOptions.find(
      (ex) => ex.id.toString() === exerciseId
    )
    if (selectedExercise) {
      setCurrentTask((prev) => ({
        ...prev,
        exerciseId,
        exerciseName: selectedExercise.name,
        exerciseCategory: selectedExercise.category,
        name: prev.name || `${selectedExercise.name} Challenge`,
        metric: '',
        unit: '',
      }))
    }
  }

  const handleMetricSelect = (metric: string) => {
    setCurrentTask((prev) => ({
      ...prev,
      metric,
      unit: '',
    }))
  }


  const getAvailableMetrics = (exerciseCategory: string) => {
    const category = exerciseCategory.toLowerCase()
    return EXERCISE_METRICS[category as keyof typeof EXERCISE_METRICS] || [
      'Weight',
      'Repetition',
    ]
  }

  const getAvailableUnits = (metric: string) => {
    return METRIC_UNITS[metric as keyof typeof METRIC_UNITS] || ['units']
  }

  const openTaskDialog = (taskIndex?: number) => {
    setShowPreview(false)

    if (taskIndex !== undefined) {
      setEditingTaskIndex(taskIndex)
      setCurrentTask(tasks[taskIndex])
    } else {
      setEditingTaskIndex(null)
      setCurrentTask({
        name: '',
        description: '',
        exerciseId: '',
        targetValue: '',
        unit: '',
        metric: '',
        pointsValue: '',
      })
    }
    setShowTaskDialog(true)
  }

  const closeTaskDialog = () => {
    setShowTaskDialog(false)
    setEditingTaskIndex(null)
  }

  const saveTask = async () => {
    if (
      !currentTask.name ||
      !currentTask.exerciseId ||
      !currentTask.targetValue ||
      !currentTask.unit ||
      !currentTask.pointsValue
    ) {
      toast.error('Please fill in all required fields')
      return
    }

    const selectedExercise = exerciseOptions.find(
      (ex) => ex.id.toString() === currentTask.exerciseId
    )

    try {
      const taskData = {
        name: currentTask.name.trim(),
        description: currentTask.description.trim(),
        exerciseId: parseInt(currentTask.exerciseId),
        targetValue: parseInt(currentTask.targetValue),
        unit: currentTask.unit,
        pointsValue: parseInt(currentTask.pointsValue),
      }

      if (editingTaskIndex !== null && currentTask.id) {
        // Update existing task
        await api.put(`/competitions/tasks/${currentTask.id}`, taskData)

        const updatedTask = {
          ...currentTask,
          exerciseName: selectedExercise?.name || '',
          exerciseCategory: selectedExercise?.category || '',
        }

        setTasks((prev) =>
          prev.map((task, index) =>
            index === editingTaskIndex ? updatedTask : task
          )
        )
        toast.success('Task updated successfully')
      } else {
        // Create new task
        const response = await api.post(`/competitions/${competition.id}/tasks`, taskData)

        const newTask = {
          id: response.data.id || response.data.data?.id,
          ...currentTask,
          exerciseName: selectedExercise?.name || '',
          exerciseCategory: selectedExercise?.category || '',
        }

        setTasks((prev) => [...prev, newTask])
        toast.success('Task added successfully')
      }

      closeTaskDialog()
    } catch (error) {
      console.error('Error saving task:', error)
      toast.error('Failed to save task')
    }
  }

  const removeTask = async (index: number) => {
    const task = tasks[index]

    if (task.id) {
      try {
        await api.delete(`/competitions/tasks/${task.id}`)
        setTasks((prev) => prev.filter((_, i) => i !== index))
        toast.success('Task deleted successfully')
      } catch (error) {
        console.error('Error deleting task:', error)
        toast.error('Failed to delete task')
      }
    } else {
      setTasks((prev) => prev.filter((_, i) => i !== index))
      toast.success('Task removed')
    }
  }

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast.error('Competition name is required')
      return false
    }

    if (!formData.startDate || !formData.endDate) {
      toast.error('Start and end dates are required')
      return false
    }

    const startDate = new Date(formData.startDate)
    const endDate = new Date(formData.endDate)

    if (startDate >= endDate) {
      toast.error('End date must be after start date')
      return false
    }

    const maxParticipants = parseInt(formData.maxParticipants)
    if (isNaN(maxParticipants) || maxParticipants <= 0) {
      toast.error('Max participants must be a positive number')
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Update competition
      const competitionData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        maxParticipants: parseInt(formData.maxParticipants),
      }

      await api.put(`/competitions/${competition.id}`, competitionData, {
        headers: { 'Content-Type': 'application/json' },
      })

      // Update image if changed
      if (imageFile) {
        const imageFormData = new FormData()
        imageFormData.append('image', imageFile)

        try {
          await api.patch(`/competitions/${competition.id}`, imageFormData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
        } catch (imageError) {
          console.warn('Image upload failed:', imageError)
        }
      }

      toast.success('Competition updated successfully!')
      onClose()
    } catch (error: any) {
      console.error('Error updating competition:', error)

      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        error.message
      toast.error(`Failed to update competition: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
      setShowPreview(false)
    }
  }

  const handlePreviewOpen = () => {
    if (!validateForm()) return
    setShowTaskDialog(false)
    setShowPreview(true)
  }

  const previewData = {
    ...formData,
    imagePreview,
    gymName: gym.name,
    tasks,
  }

  return (
    <>
      <div className="space-y-6">
        {/* Competition Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Competition Details</h3>

          <div className="space-y-2">
            <Label htmlFor="name">Competition Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Winter Strength Challenge"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                name="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                name="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={handleInputChange}
                required
                min={formData.startDate}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxParticipants">Max Participants *</Label>
            <Input
              id="maxParticipants"
              name="maxParticipants"
              type="number"
              min="1"
              value={formData.maxParticipants}
              onChange={handleInputChange}
              placeholder="50"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Build strength during the winter months with this comprehensive challenge."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Competition Image</Label>
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
                    className="absolute top-2 right-2 cursor-pointer"
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
        </div>

        {/* Tasks Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Competition Tasks</h3>
            <Button onClick={() => openTaskDialog()} size="sm" className='cursor-pointer'>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500">No tasks added yet</p>
              <p className="text-sm text-gray-400">
                Click "Add Task" to create your first task
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task, index) => (
                <div
                  key={task.id || index}
                  className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{task.name}</h4>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {task.exerciseName}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Target: {task.targetValue} {task.unit} • Points: {task.pointsValue}
                    </p>
                    {task.description && (
                      <p className="text-sm text-gray-500 mt-1">
                        {task.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className='cursor-pointer'
                      onClick={() => openTaskDialog(index)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className='cursor-pointer'
                      onClick={() => removeTask(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handlePreviewOpen}
            className="flex-1 cursor-pointer"
          >
            Preview
          </Button>
          <Button type="button" variant="outline" onClick={onClose} className='cursor-pointer'>
            Cancel
          </Button>
        </div>
      </div>

      {/* Task Dialog - Same as AddCompetitionForm */}
      <Dialog open={showTaskDialog} onOpenChange={closeTaskDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTaskIndex !== null ? 'Edit Task' : 'Add New Task'}
            </DialogTitle>
            <DialogDescription>
              {editingTaskIndex !== null
                ? 'Modify the task details below.'
                : 'Create a new task for your competition.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="exerciseSelect">Exercise *</Label>
              <Select
                value={currentTask.exerciseId}
                onValueChange={handleExerciseSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an exercise" />
                </SelectTrigger>
                <SelectContent>
                  {exerciseOptions.map((exercise) => (
                    <SelectItem key={exercise.id} value={exercise.id.toString()}>
                      <div className="flex items-center gap-2">
                        <span>{exercise.name}</span>
                        <span className="text-xs text-gray-500">
                          ({exercise.category})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taskName">Task Name *</Label>
              <Input
                id="taskName"
                name="name"
                value={currentTask.name}
                onChange={handleTaskInputChange}
                placeholder="Deadlift Challenge"
                required
              />
            </div>


            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="metric">Metric *</Label>
                <Select
                  value={currentTask.metric}
                  onValueChange={handleMetricSelect}
                  disabled={!currentTask.exerciseCategory}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !currentTask.exerciseCategory
                          ? 'Select exercise first'
                          : 'Select metric'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {currentTask.exerciseCategory &&
                      getAvailableMetrics(currentTask.exerciseCategory).map(
                        (metric) => (
                          <SelectItem key={metric} value={metric}>
                            {metric}
                          </SelectItem>
                        )
                      )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit *</Label>
                <Select
                  value={currentTask.unit}
                  onValueChange={(value) =>
                    setCurrentTask((prev) => ({ ...prev, unit: value }))
                  }
                  disabled={!currentTask.metric}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !currentTask.metric
                          ? 'Select metric first'
                          : 'Select unit'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {currentTask.metric &&
                      getAvailableUnits(currentTask.metric).map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetValue">Target Value *</Label>
                  <Input
                    id="targetValue"
                    name="targetValue"
                    type="number"
                    min="1"
                    value={currentTask.targetValue}
                    onChange={handleTaskInputChange}
                    placeholder="5000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pointsValue">Points Value *</Label>
                  <Input
                    id="pointsValue"
                    name="pointsValue"
                    type="number"
                    min="1"
                    value={currentTask.pointsValue}
                    onChange={handleTaskInputChange}
                    placeholder="200"
                    required
                  />
                </div>
              </div>

            </div>

            <div className="space-y-2">
              <Label htmlFor="taskDescription">Task Description</Label>
              <Textarea
                id="taskDescription"
                name="description"
                value={currentTask.description}
                onChange={handleTaskInputChange}
                placeholder="Lift a total of 5000kg in deadlifts during the competition period"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" className='cursor-pointer' onClick={closeTaskDialog}>
              Cancel
            </Button>
            <Button onClick={saveTask} className='cursor-pointer'>
              {editingTaskIndex !== null ? 'Update Task' : 'Add Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      {showPreview && (
        <PreviewDialog
          open={showPreview}
          onOpenChange={setShowPreview}
          title="Competition Preview"
          data={previewData}
          onConfirm={handleSubmit}
          isSubmitting={isSubmitting}
          confirmText="Update Competition"
        />
      )}
    </>
  )
}

export default EditCompetitionForm
