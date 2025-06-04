// src/services/membership.service.js
const prisma = require('../config/prisma');
const { ApiError } = require('../utils/ApiError');

const membershipService = {
  getUserMemberships: async (userId) => {
    const memberships = await prisma.userMembership.findMany({
      where: { userId },
      include: {
        gym: {
          select: {
            id: true,
            name: true,
            address: true,
            imageUrl: true
          }
        },
        membershipPlan: true
      },
      orderBy: {
        endDate: 'desc'
      }
    });
    
    return memberships;
  },

  getCurrentMonthRevenueForOwnedGyms: async (ownerId) => {
      const ownedGyms = await prisma.gym.findMany({
        where: { ownerId },
        select: { id: true },
      });

      if (ownedGyms.length === 0) {
        return 0;
      }
      const ownedGymIds = ownedGyms.map(gym => gym.id);

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999); // Last moment of the month

      const revenueData = await prisma.membershipPayment.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          status: 'completed', // Only count completed payments
          paymentDate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
          userMembership: {
            gymId: { in: ownedGymIds },
          },
        },
      });
      return revenueData._sum.amount || 0; // Return 0 if sum is null
    },
  
  getMembershipById: async (userId, membershipId) => {
    const membership = await prisma.userMembership.findFirst({
      where: {
        id: membershipId,
        userId
      },
      include: {
        gym: {
          select: {
            id: true,
            name: true,
            address: true,
            contactInfo: true,
            imageUrl: true
          }
        },
        membershipPlan: true,
        membershipPayments: {
          orderBy: {
            paymentDate: 'desc'
          },
          take: 5
        },
        userBookings: {
          where: {
            bookingStatus: 'confirmed'
          },
          include: {
            schedule: {
              include: {
                gymClass: true
              }
            }
          },
          orderBy: {
            bookingTime: 'desc'
          },
          take: 5
        }
      }
    });
    
    if (!membership) {
      throw new ApiError(404, 'Membership not found');
    }
    
    return membership;
  },
  
  createMembership: async (membershipData) => {
    const { userId, gymId, planId, autoRenew, paymentMethod } = membershipData;
    
    // Check if the membership plan exists
    const plan = await prisma.membershipPlan.findFirst({
      where: {
        id: planId,
        gymId,
        isActive: true
      }
    });
    
    if (!plan) {
      throw new ApiError(404, 'Membership plan not found or inactive');
    }
    
    // Check if user already has an active membership at this gym
    const existingMembership = await prisma.userMembership.findFirst({
      where: {
        userId,
        gymId,
        status: 'active',
        endDate: {
          gte: new Date()
        }
      }
    });
    
    if (existingMembership) {
      throw new ApiError(409, 'You already have an active membership at this gym');
    }
    
    // Calculate start and end dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.durationDays);
    
    // Start a transaction to create membership and payment record
    const result = await prisma.$transaction(async (prisma) => {
      // Create membership
      const membership = await prisma.userMembership.create({
        data: {
          userId,
          gymId,
          planId,
          startDate,
          endDate,
          status: 'active',
          autoRenew,
          lastBookingCountReset: new Date() // Initialize to today
        },
        include: {
          gym: {
            select: {
              name: true
            }
          },
          membershipPlan: true
        }
      });
      
      // Create payment record
      const payment = await prisma.membershipPayment.create({
        data: {
          membershipId: membership.id,
          amount: plan.price,
          paymentDate: new Date(),
          paymentMethod,
          status: 'completed', // In a real app, this would depend on payment processing
          transactionId: `TXN${Date.now()}` // In a real app, this would come from payment processor
        }
      });
      
      return { membership, payment };
    });
    
    // Return full membership with payment details
    return result;
  },
  
  updateMembership: async (userId, membershipId, updateData) => {
    // Check if membership exists and belongs to user
    const membership = await prisma.userMembership.findFirst({
      where: {
        id: membershipId,
        userId
      }
    });
    
    if (!membership) {
      throw new ApiError(404, 'Membership not found');
    }
    
    // Check if membership is active
    if (membership.status !== 'active') {
      throw new ApiError(400, 'Only active memberships can be updated');
    }
    
    // Update membership
    const updatedMembership = await prisma.userMembership.update({
      where: { id: membershipId },
      data: {
        autoRenew: updateData.autoRenew
      },
      include: {
        gym: {
          select: {
            id: true,
            name: true
          }
        },
        membershipPlan: true
      }
    });
    
    return updatedMembership;
  },
  
  cancelMembership: async (userId, membershipId) => {
    // Check if membership exists and belongs to user
    const membership = await prisma.userMembership.findFirst({
      where: {
        id: membershipId,
        userId
      }
    });
    
    if (!membership) {
      throw new ApiError(404, 'Membership not found');
    }
    
    // Check if membership is active
    if (membership.status !== 'active') {
      throw new ApiError(400, 'Only active memberships can be cancelled');
    }
    
    // Update membership status
    await prisma.userMembership.update({
      where: { id: membershipId },
      data: {
        status: 'cancelled',
        autoRenew: false
      }
    });
    
    // In a real app, you might want to issue a refund if applicable
    // which would create a new payment record with a negative amount
  },
  
  getMembershipPayments: async (userId, membershipId) => {
    // Check if membership exists and belongs to user
    const membership = await prisma.userMembership.findFirst({
      where: {
        id: membershipId,
        userId
      },
      select: { id: true }
    });
    
    if (!membership) {
      throw new ApiError(404, 'Membership not found');
    }
    
    // Get payment history
    const payments = await prisma.membershipPayment.findMany({
      where: { membershipId },
      orderBy: {
        paymentDate: 'desc'
      }
    });
    
    return payments;
  },
  
  // Helper function to reset weekly booking counts
  // This would typically be called by a scheduled job
  resetWeeklyBookingCounts: async () => {
    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    // Get active memberships with last reset more than a week ago
    const membershipsToReset = await prisma.userMembership.findMany({
      where: {
        status: 'active',
        lastBookingCountReset: {
          lt: oneWeekAgo
        }
      }
    });
    
    // Reset booking counts in batches to avoid overloading the database
    const batchSize = 100;
    for (let i = 0; i < membershipsToReset.length; i += batchSize) {
      const batch = membershipsToReset.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(membership => 
          prisma.userMembership.update({
            where: { id: membership.id },
            data: {
              bookingsUsedThisWeek: 0,
              lastBookingCountReset: today
            }
          })
        )
      );
    }
    
    return membershipsToReset.length;
  }
};

module.exports = { membershipService };