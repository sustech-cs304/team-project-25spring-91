"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Gym } from '@/types/gym'
import AddSubscriptionForm from './add-subscription-form'
import AddGymClassForm from './add-gym-class-form'
import AddCompetitionForm from './add-competition-form'

interface AdminUpdateDialogProps {
  gym: Gym
  open: boolean
  onOpenChange: (open: boolean) => void
}

const AdminUpdateDialog = ({
  gym,
  open,
  onOpenChange,
}: AdminUpdateDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update {gym.name}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="subscription" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="subscription">Add Subscription</TabsTrigger>
            <TabsTrigger value="class">Add Gym Class</TabsTrigger>
            <TabsTrigger value="competition">Add Competition</TabsTrigger>
          </TabsList>
          
          <TabsContent value="subscription" className="mt-6">
            <AddSubscriptionForm gym={gym} onClose={() => onOpenChange(false)} />
          </TabsContent>
          
          <TabsContent value="class" className="mt-6">
            <AddGymClassForm gym={gym} onClose={() => onOpenChange(false)} />
          </TabsContent>
          
          <TabsContent value="competition" className="mt-6">
            <AddCompetitionForm gym={gym} onClose={() => onOpenChange(false)} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default AdminUpdateDialog
