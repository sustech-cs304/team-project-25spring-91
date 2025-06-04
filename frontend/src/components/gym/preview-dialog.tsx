"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import Image from 'next/image'

interface PreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  data: any
  onConfirm: () => void
  isSubmitting: boolean
  confirmText?: string
}

const PreviewDialog = ({
  open,
  onOpenChange,
  title,
  data,
  onConfirm,
  isSubmitting,
  confirmText = 'Confirm & Create', // Default value
}: PreviewDialogProps) => {
  const renderPreviewContent = () => {
    if (title.includes('Subscription')) {
      return (
        <div className="space-y-4">
          {data.imagePreview && (
            <Image
              src={data.imagePreview}
              alt="Preview"
              className="w-full h-48 object-cover rounded"
            />
          )}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{data.name}</h3>
            <p className="text-sm text-gray-600">
              ${data.price} for {data.duration} {data.durationType}
            </p>
            <p className="text-sm">{data.description}</p>
            {data.features && (
              <div>
                <p className="font-medium text-sm">Features:</p>
                <p className="text-sm">{data.features}</p>
              </div>
            )}
          </div>
        </div>
      )
    }

    if (title.includes('Class')) {
      return (
        <div className="space-y-4">
          {data.imagePreview && (
            <Image
              src={data.imagePreview}
              alt="Preview"
              className="w-full h-48 object-cover rounded"
            />
          )}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{data.name}</h3>
            <p className="text-sm text-gray-600">
              {data.durationMinutes} minutes • {data.difficultyLevel} • Max {data.maxCapacity} people
            </p>
            <p className="text-sm">{data.description}</p>
            {data.membersOnly && (
              <p className="text-sm font-medium text-blue-600">Members Only</p>
            )}
            {data.schedules && data.schedules.length > 0 && (
              <div>
                <p className="font-medium text-sm">Schedules:</p>
                {data.schedules.map((schedule: any) => (
                  <div key={schedule.id} className="text-sm border-l-2 border-gray-200 pl-2">
                    <p>{new Date(schedule.startTime).toLocaleString()} - {new Date(schedule.endTime).toLocaleString()}</p>
                    <p>Instructor: {schedule.instructor}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )
    }

    if (title.includes('Competition')) {
      return (
        <div className="space-y-4">
          {data.imagePreview && (
            <Image
              src={data.imagePreview}
              alt="Preview"
              className="w-full h-48 object-cover rounded"
            />
          )}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{data.name}</h3>
            <p className="text-sm text-gray-600">
              Max {data.maxParticipants} participants
            </p>
            <div className="text-sm">
              <p><strong>Start:</strong> {new Date(data.startDate).toLocaleString()}</p>
              <p><strong>End:</strong> {new Date(data.endDate).toLocaleString()}</p>
            </div>
            <p className="text-sm">{data.description}</p>
            {data.tasks && data.tasks.length > 0 && (
              <div>
                <p className="font-medium text-sm">Tasks ({data.tasks.length}):</p>
                <div className="space-y-1">
                  {data.tasks.map((task: any, index: number) => (
                    <div key={index} className="text-sm border-l-2 border-gray-200 pl-2">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{task.name}</p>
                        <span className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">
                          {task.exerciseName}
                        </span>
                        <span className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">
                          {task.metric}
                        </span>
                      </div>
                      <p>Target: {task.targetValue} {task.unit} • Points: {task.pointsValue}</p>
                      {task.description && <p className="text-gray-600">{task.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )
    }



    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          {renderPreviewContent()}
        </ScrollArea>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default PreviewDialog
