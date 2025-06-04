// components/gym/owner-membership-dialog.tsx
"use client"

import React, { useEffect, useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Edit, Trash2, Plus } from "lucide-react";
import { Gym, MembershipPlan } from '@/types/gym';
import { toast } from 'sonner';
import api from '@/lib/api';

interface OwnerMembershipDialogProps {
  gym: Gym;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface MembershipFormData {
  name: string;
  description: string;
  price: string;
  durationDays: string;
  maxBookingsPerWeek: string;
  isActive: boolean;
}

const initialFormData: MembershipFormData = {
  name: '',
  description: '',
  price: '',
  durationDays: '',
  maxBookingsPerWeek: '10',
  isActive: true,
};

const OwnerMembershipDialog: React.FC<OwnerMembershipDialogProps> = ({ 
  gym, 
  open, 
  onOpenChange 
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [membershipPlans, setMembershipPlans] = useState<MembershipPlan[]>([]);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [deletingPlanId, setDeletingPlanId] = useState<number | string | null>(null);
  
  const [formData, setFormData] = useState<MembershipFormData>(initialFormData);

  useEffect(() => {
    if (open) {
      handleFetchPlans();
      resetForm();
    } else {
      resetAllStates();
    }
  }, [open, gym.id]);

  const resetForm = useCallback(() => {
    setFormData({ ...initialFormData });
    setEditingPlan(null);
    setShowAddForm(false);
    setIsSubmitting(false);
  }, []);

  const resetAllStates = useCallback(() => {
    resetForm();
    setMembershipPlans([]);
    setLoading(false);
    setDeletingPlanId(null);
  }, [resetForm]);

  const handleFetchPlans = async () => {
    try {
      setLoading(true);
      const { data } = await api.get<{ data: MembershipPlan[] }>(
        `/gyms/${gym.id}/membership-plans`
      );
      setMembershipPlans(data.data || []);
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Failed to load membership plans");
      setMembershipPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = (plan: MembershipPlan) => {
    setFormData({
      name: plan.name,
      description: plan.description,
      price: plan.price.toString(),
      durationDays: plan.durationDays.toString(),
      maxBookingsPerWeek: plan.maxBookingsPerWeek.toString(),
      isActive: plan.isActive,
    });
    setEditingPlan(plan);
    setShowAddForm(true);
  };

  const handleCancel = () => {
    resetForm();
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        durationDays: parseInt(formData.durationDays),
        maxBookingsPerWeek: parseInt(formData.maxBookingsPerWeek),
        isActive: formData.isActive,
      };

      if (!submitData.name || isNaN(submitData.price) || isNaN(submitData.durationDays)) {
        toast.error('Please fill in all required fields correctly');
        return;
      }

      if (editingPlan) {
        await api.put(`/membership-plans/plans/${editingPlan.id}`, submitData);
        toast.success('Membership plan updated successfully!');
      } else {
        await api.post(`/gyms/${gym.id}/membership-plans`, submitData);
        toast.success('Membership plan created successfully!');
      }
      
      resetForm();
      await handleFetchPlans();
    } catch (error: any) {
      console.error('Error saving plan:', error);
      toast.error(
        editingPlan 
          ? 'Failed to update membership plan' 
          : 'Failed to create membership plan'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // DIRECT DELETE - No confirmation
  const handleDelete = async (plan: MembershipPlan) => {
    if (deletingPlanId === plan.id) return; // Prevent double-click
    
    setDeletingPlanId(plan.id);
    
    try {
      await api.delete(`/membership-plans/plans/${plan.id}`);
      toast.success(`"${plan.name}" deleted successfully!`);
      await handleFetchPlans();
    } catch (error: any) {
      console.error('Delete error:', error);
      
      let errorMessage = 'Failed to delete membership plan';
      if (error?.response?.status === 404) {
        errorMessage = 'Membership plan not found';
      } else if (error?.response?.status === 403) {
        errorMessage = 'You do not have permission to delete this plan';
      } else if (error?.response?.status === 409) {
        errorMessage = 'Cannot delete plan - it may be in use by active members';
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setDeletingPlanId(null);
    }
  };

  const handleDialogOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetAllStates();
    }
    onOpenChange(newOpen);
  };

  const isFormValid = formData.name.trim() && 
                     formData.price && 
                     !isNaN(parseFloat(formData.price)) &&
                     formData.durationDays &&
                     !isNaN(parseInt(formData.durationDays));

  if (showAddForm) {
    return (
      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? 'Edit' : 'Add'} Membership Plan
            </DialogTitle>
            <DialogDescription>
              {editingPlan 
                ? 'Update the membership plan details below.' 
                : 'Create a new membership plan for your gym.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Plan Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Gold Monthly"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe what's included in this plan"
                rows={3}
                disabled={isSubmitting}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="49.99"
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="durationDays">Duration (Days) *</Label>
                <Input
                  id="durationDays"
                  name="durationDays"
                  type="number"
                  min="1"
                  value={formData.durationDays}
                  onChange={handleInputChange}
                  placeholder="30"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxBookingsPerWeek">Max Bookings Per Week</Label>
              <Input
                id="maxBookingsPerWeek"
                name="maxBookingsPerWeek"
                type="number"
                min="1"
                value={formData.maxBookingsPerWeek}
                onChange={handleInputChange}
                placeholder="10"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="isActive">Status</Label>
              <Select
                value={formData.isActive ? 'active' : 'inactive'}
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, isActive: value === 'active' }))
                }
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !isFormValid}
            >
              {isSubmitting ? 'Saving...' : editingPlan ? 'Update' : 'Create'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-semibold">
                {gym.name} - Membership Plans
              </DialogTitle>
              <DialogDescription>
                Manage membership plans for your gym
              </DialogDescription>
            </div>
            <Button 
              onClick={() => setShowAddForm(true)}
              disabled={loading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Plan
            </Button>
          </div>
        </DialogHeader>

        <div className="py-4">
          <div className="max-h-[450px] overflow-y-auto pr-2">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-muted-foreground">Loading plans...</div>
              </div>
            ) : membershipPlans.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center space-y-2">
                  <div className="text-4xl opacity-20">📋</div>
                  <p className="text-muted-foreground">No membership plans yet</p>
                  <Button onClick={() => setShowAddForm(true)}>
                    Create your first plan
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {membershipPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{plan.name}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            plan.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {plan.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm mb-2">
                          {plan.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="font-semibold">${plan.price}</span>
                          <span>{plan.durationDays} days</span>
                          <span>{plan.maxBookingsPerWeek} bookings/week</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(plan)}
                          disabled={loading}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(plan)}
                          disabled={loading || deletingPlanId === plan.id}
                        >
                          {deletingPlanId === plan.id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OwnerMembershipDialog;