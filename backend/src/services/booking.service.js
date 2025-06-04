// src/services/booking.service.js
const prisma = require('../config/prisma');
const { ApiError } = require('../utils/ApiError');

const bookingService = {
  getUserBookings: async (userId) => {
    const bookings = await prisma.userBooking.findMany({
      where: { userId },
      include: {
        schedule: {
          include: {
            gymClass: {
              include: {
                gym: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        },
        userMembership: {
          select: {
            id: true,
            status: true
          }
        }
      },
      orderBy: {
        schedule: {
          startTime: 'desc'
        }
      }
    });
    
    return bookings;
  },

  getTotalBookingsForOwnedGyms: async (ownerId) => {
      const ownedGyms = await prisma.gym.findMany({
        where: { ownerId },
        select: { id: true },
      });

      if (ownedGyms.length === 0) {
        return 0;
      }
      const ownedGymIds = ownedGyms.map(gym => gym.id);

      const totalBookings = await prisma.userBooking.count({
        where: {
          schedule: {
            gymClass: {
              gymId: { in: ownedGymIds },
            },
          },
          // Consider only confirmed or attended bookings as "actual" bookings
          bookingStatus: { in: ['confirmed', 'attended'] },
        },
      });
      return totalBookings;
    },
  
  getUpcomingBookings: async (userId) => {
    const now = new Date();
    
    const bookings = await prisma.userBooking.findMany({
      where: {
        userId,
        bookingStatus: 'confirmed',
        schedule: {
          startTime: {
            gte: now
          }
        }
      },
      include: {
        schedule: {
          include: {
            gymClass: {
              include: {
                gym: {
                  select: {
                    id: true,
                    name: true,
                    address: true
                  }
                }
              }
            }
          }
        },
        userMembership: {
          select: {
            id: true,
            status: true
          }
        }
      },
      orderBy: {
        schedule: {
          startTime: 'asc'
        }
      }
    });
    
    return bookings;
  },
  
getBookingHistory: async (userId, { page = 1, limit = 10, paginate = true }) => {
      const now = new Date();
      const where = {
        userId,
        schedule: { startTime: { lt: now } },
      };
      const includeOptions = {
        schedule: {
          include: {
            gymClass: {
              include: { gym: { select: { id: true, name: true } } },
            },
          },
        },
      };
      const orderByOptions = { schedule: { startTime: 'desc' } };

      if (!paginate) {
        const bookings = await prisma.userBooking.findMany({
          where,
          include: includeOptions,
          orderBy: orderByOptions,
        });
        return {
          bookings,
          totalItems: bookings.length,
          paginationApplied: false,
        };
      }

      const skip = (page - 1) * limit;
      const totalItems = await prisma.userBooking.count({ where });
      const bookings = await prisma.userBooking.findMany({
        where,
        include: includeOptions,
        orderBy: orderByOptions,
        skip,
        take: limit,
      });

      return {
        bookings,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        paginationApplied: true,
      };
    },
  
  getBookingById: async (userId, bookingId) => {
    const booking = await prisma.userBooking.findFirst({
      where: {
        id: bookingId,
        userId
      },
      include: {
        schedule: {
          include: {
            gymClass: {
              include: {
                gym: {
                  select: {
                    id: true,
                    name: true,
                    address: true,
                    contactInfo: true
                  }
                }
              }
            }
          }
        },
        userMembership: {
          include: {
            membershipPlan: true
          }
        }
      }
    });
    
    if (!booking) {
      throw new ApiError(404, 'Booking not found');
    }
    
    return booking;
  },
  
  createBooking: async (bookingData) => {
    const { userId, scheduleId, membershipId } = bookingData;
    
    // Check if the schedule exists
    const schedule = await prisma.classSchedule.findUnique({
      where: { id: scheduleId },
      include: {
        gymClass: true,
        _count: {
          select: {
            userBookings: {
              where: {
                bookingStatus: 'confirmed'
              }
            }
          }
        }
      }
    });
    
    if (!schedule) {
      throw new ApiError(404, 'Class schedule not found');
    }
    
    // Check if the class is cancelled
    if (schedule.isCancelled) {
      throw new ApiError(400, 'This class has been cancelled');
    }
    
    // Check if the class is in the past
    if (schedule.startTime < new Date()) {
      throw new ApiError(400, 'Cannot book a class that has already started');
    }
    
    // Check if the class is full
    const maxCapacity = schedule.gymClass.maxCapacity || 0;
    const currentBookings = schedule._count.userBookings;
    
    if (maxCapacity > 0 && currentBookings >= maxCapacity) {
      throw new ApiError(400, 'This class is already full');
    }
    
    // Check if user already has a booking for this schedule
    const existingBooking = await prisma.userBooking.findFirst({
      where: {
        userId,
        scheduleId,
        bookingStatus: {
          not: 'cancelled'
        }
      }
    });
    
    if (existingBooking) {
      throw new ApiError(409, 'You already have a booking for this class');
    }
    
    // Check if the membership exists and is active
    const membership = await prisma.userMembership.findFirst({
      where: {
        id: membershipId,
        userId,
        status: 'active',
        endDate: {
          gte: new Date()
        },
        gym: {
          id: schedule.gymClass.gymId
        }
      },
      include: {
        membershipPlan: true
      }
    });
    
    if (!membership) {
      throw new ApiError(404, 'Active membership not found for this gym');
    }
    
    // Check if the class requires membership
    if (schedule.gymClass.membersOnly && membership.status !== 'active') {
      throw new ApiError(403, 'This class is only available to active members');
    }
    
    // Check if user has exceeded weekly booking limit
    if (membership.membershipPlan.maxBookingsPerWeek !== null) {
      if (membership.bookingsUsedThisWeek >= membership.membershipPlan.maxBookingsPerWeek) {
        throw new ApiError(403, 'You have reached your weekly booking limit for this membership');
      }
    }
    
    // Start a transaction to create booking and update counts
    const result = await prisma.$transaction(async (prisma) => {
      // Create booking
      const booking = await prisma.userBooking.create({
        data: {
          userId,
          membershipId,
          scheduleId,
          bookingStatus: 'confirmed'
        },
        include: {
          schedule: {
            include: {
              gymClass: {
                include: {
                  gym: {
                    select: {
                      id: true,
                      name: true
                    }
                  }
                }
              }
            }
          },
          userMembership: {
            include: {
              membershipPlan: true
            }
          }
        }
      });
      
      // Update schedule booking count
      await prisma.classSchedule.update({
        where: { id: scheduleId },
        data: {
          currentBookings: {
            increment: 1
          }
        }
      });
      
      // Update membership booking count
      await prisma.userMembership.update({
        where: { id: membershipId },
        data: {
          bookingsUsedThisWeek: {
            increment: 1
          }
        }
      });
      
      return booking;
    });
    
    return result;
  },
  
  cancelBooking: async (userId, bookingId, cancellationReason) => {
    // Check if booking exists and belongs to user
    const booking = await prisma.userBooking.findFirst({
      where: {
        id: bookingId,
        userId
      },
      include: {
        schedule: true
      }
    });
    
    if (!booking) {
      throw new ApiError(404, 'Booking not found');
    }
    
    // Check if booking is already cancelled
    if (booking.bookingStatus === 'cancelled') {
      throw new ApiError(400, 'Booking is already cancelled');
    }
    
    // Check if class has already started
    if (booking.schedule.startTime < new Date()) {
      throw new ApiError(400, 'Cannot cancel a booking for a class that has already started');
    }
    
    // Start a transaction to update booking and counts
    await prisma.$transaction(async (prisma) => {
      // Update booking status
      await prisma.userBooking.update({
        where: { id: bookingId },
        data: {
          bookingStatus: 'cancelled',
          cancellationReason
        }
      });
      
      // Decrement schedule booking count
      await prisma.classSchedule.update({
        where: { id: booking.scheduleId },
        data: {
          currentBookings: {
            decrement: 1
          }
        }
      });

      
      
      // Decrement membership booking count if cancelled within the same week
      // This allows the user to book another class
      const lastBookingReset = await prisma.userMembership.findUnique({
        where: { id: booking.membershipId },
        select: { lastBookingCountReset: true }
      });
      
      if (lastBookingReset && lastBookingReset.lastBookingCountReset) {
        const bookingTime = new Date(booking.bookingTime);
        
        if (bookingTime > lastBookingReset.lastBookingCountReset) {
          await prisma.userMembership.update({
            where: { id: booking.membershipId },
            data: {
              bookingsUsedThisWeek: {
                decrement: 1
              }
            }
          });
        }
      }
    });
  },
  
  markBookingAttended: async (userId, bookingId) => {
    // This would typically be done by gym staff, but we'll allow users to do it for demo purposes
    
    // Check if booking exists and belongs to user
    const booking = await prisma.userBooking.findFirst({
      where: {
        id: bookingId,
        userId
      },
      include: {
        schedule: true
      }
    });
    
    if (!booking) {
      throw new ApiError(404, 'Booking not found');
    }
    
    // Check if booking is confirmed
    if (booking.bookingStatus !== 'confirmed') {
      throw new ApiError(400, 'Only confirmed bookings can be marked as attended');
    }
    
    // Check if class has started
    const now = new Date();
    if (booking.schedule.startTime > now) {
      throw new ApiError(400, 'Cannot mark as attended before the class starts');
    }
    
    // Update booking
    await prisma.userBooking.update({
      where: { id: bookingId },
      data: {
        attended: true,
        bookingStatus: 'attended'
      }
    });
  }
};

module.exports = { bookingService };