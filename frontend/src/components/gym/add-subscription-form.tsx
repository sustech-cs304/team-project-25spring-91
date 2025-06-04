"use client"

import { useState } from 'react'
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
import { toast } from 'sonner'
import type { Gym } from '@/types/gym'
import PreviewDialog from './preview-dialog'
import { X, Upload } from 'lucide-react'
import api from '@/lib/api'

interface AddSubscriptionFormProps {
  gym: Gym
  onClose: () => void
}

interface SubscriptionFormData {
  name: string
  description: string
  price: string
  duration: string
  durationType: string
  features: string
}

const AddSubscriptionForm = ({ gym, onClose }: AddSubscriptionFormProps) => {
  const [formData, setFormData] = useState<SubscriptionFormData>({
    name: '',
    description: '',
    price: '',
    duration: '',
    durationType: 'months',
    features: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

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

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // Convert duration to days based on durationType
      let durationDays: number
      const durationValue = parseInt(formData.duration)
      
      switch (formData.durationType) {
        case 'days':
          durationDays = durationValue
          break
        case 'weeks':
          durationDays = durationValue * 7
          break
        case 'months':
          durationDays = durationValue * 30
          break
        case 'years':
          durationDays = durationValue * 365
          break
        default:
          durationDays = durationValue * 30 // default to months
      }

      const submitData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        durationDays: durationDays,
        maxBookingsPerWeek: 10, // You might want to make this configurable
        isActive: true,
      }

      const response = await api.post(
        `/gyms/${gym.id}/membership-plans`,
        submitData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      toast.success('Subscription created successfully!')
      onClose()
    } catch (error: any) {
      console.error('Error creating subscription:', error)
      toast.error('Failed to create subscription. Please try again.')
    } finally {
      setIsSubmitting(false)
      setShowPreview(false)
    }
  }

  const previewData = {
    ...formData,
    imagePreview,
    gymName: gym.name,
  }

  return (
    <>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Subscription Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Premium Membership"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="99.99"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Input
              id="duration"
              name="duration"
              type="number"
              value={formData.duration}
              onChange={handleInputChange}
              placeholder="12"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="durationType">Duration Type</Label>
            <Select
              value={formData.durationType}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, durationType: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="days">Days</SelectItem>
                <SelectItem value="weeks">Weeks</SelectItem>
                <SelectItem value="months">Months</SelectItem>
                <SelectItem value="years">Years</SelectItem>
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
            placeholder="Describe the subscription benefits..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="features">Features (comma-separated)</Label>
          <Textarea
            id="features"
            name="features"
            value={formData.features}
            onChange={handleInputChange}
            placeholder="Unlimited access, Personal trainer, Group classes"
            rows={2}
          />
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
        title="Subscription Preview"
        data={previewData}
        onConfirm={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </>
  )
}

export default AddSubscriptionForm
