// src/controllers/class.controller.js
const prisma = require('../config/prisma');
const { classService } = require('../services/class.service');
const { ApiError } = require('../utils/ApiError');
const fs = require('fs').promises;
const path = require('path');

const classController = {
getAllGymClasses: async (req, res) => {
      const { gymId, difficultyLevel, search, page, limit, paginate } = req.query;

      const classesData = await classService.getAllGymClasses({
        gymId: gymId ? parseInt(gymId) : undefined,
        difficultyLevel,
        search,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10,
        paginate: paginate !== 'false',
      });

      if (!classesData.paginationApplied) {
        res.status(200).json({
          status: 'success',
          results: classesData.totalItems,
          data: classesData.classes,
        });
      } else {
        res.status(200).json({
          status: 'success',
          results: classesData.classes.length,
          pagination: {
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10,
            totalPages: classesData.totalPages,
            totalItems: classesData.totalItems,
          },
          data: classesData.classes,
        });
      }
    },
  
  getGymClassById: async (req, res) => {
    const classId = parseInt(req.params.id);
    const gymClass = await classService.getGymClassById(classId);
    
    res.status(200).json({
      status: 'success',
      data: gymClass
    });
  },
  
getClassSchedules: async (req, res) => {
    const classId = parseInt(req.params.id);
    const { startDate, endDate } = req.query; // Will be string or undefined
    
    const schedules = await classService.getClassSchedules(
      classId,
      startDate, // Pass directly
      endDate   // Pass directly
    );
    
    res.status(200).json({
      status: 'success',
      results: schedules.length,
      data: schedules
    });
  },
  
  createClass: async (req, res) => {
    const { gymId } = req.body;
    const userId = req.user.id;
    
    // Check if the gym exists
    const gym = await prisma.gym.findUnique({
      where: { id: gymId }
    });
    
    if (!gym) {
      throw new ApiError(404, 'Gym not found');
    }
    
    // If user is a gym owner, check if they own this gym
    if (req.user.role === 'gym_owner') {
      // Check if user owns this gym
      if (gym.ownerId !== userId) {
        throw new ApiError(403, 'You do not have permission to create classes for this gym');
      }
    }

  const classData = {
    ...req.body,
    imageUrl: req.processedImage ? req.processedImage.url : null
  };
    
    // Create the class
    const newClass = await prisma.gymClass.create({
      data: classData
    });
    
    res.status(201).json({
      status: 'success',
      message: 'Class created successfully',
      data: newClass
    });
  },
  
  updateClass: async (req, res) => {
    const classId = parseInt(req.params.id);
    
    // First check if class exists
    const gymClass = await prisma.gymClass.findUnique({
      where: { id: classId }
    });
    
    if (!gymClass) {
      throw new ApiError(404, 'Class not found');
    }

      // Prepare update data
  const updateData = { ...req.body };
  
  // If new image is uploaded, update imageUrl and delete old image
  if (req.processedImage) {
    // Delete old image if exists
    if (gymClass.imageUrl) {
      try {
        const oldFilename = gymClass.imageUrl.split('/').pop();
        const oldFilepath = path.join(__dirname, '../../uploads/gym-classes', oldFilename);
        await fs.unlink(oldFilepath);
      } catch (error) {
        console.log('Old image not found or already deleted');
      }
    }
    
    updateData.imageUrl = req.processedImage.url;
  }
    
    // Update class
    const updatedClass = await prisma.gymClass.update({
      where: { id: classId },
      data: updateData
    });
    
    res.status(200).json({
      status: 'success',
      message: 'Class updated successfully',
      data: updatedClass
    });
  },
  
  deleteClass: async (req, res) => {
    const classId = parseInt(req.params.id);
    
    // First check if class exists
    const gymClass = await prisma.gymClass.findUnique({
      where: { id: classId }
    });
    
    if (!gymClass) {
      throw new ApiError(404, 'Class not found');
    }
    
    // Check if there are any schedules or bookings for this class
    const schedulesCount = await prisma.classSchedule.count({
      where: { classId }
    });
    
    if (schedulesCount > 0) {
      // Instead of hard deletion, set isActive to false
      const updatedClass = await prisma.gymClass.update({
        where: { id: classId },
        data: { isActive: false }
      });
      
      return res.status(200).json({
        status: 'success',
        message: 'Class has been deactivated as it has associated schedules',
        data: updatedClass
      });
    }

      // Delete associated image if exists
  if (gymClass.imageUrl) {
    try {
      const filename = gymClass.imageUrl.split('/').pop();
      const filepath = path.join(__dirname, '../../uploads/gym-classes', filename);
      await fs.unlink(filepath);
    } catch (error) {
      console.log('Image not found or already deleted');
    }
  }
    
    // If no schedules, perform a hard delete
    await prisma.gymClass.delete({
      where: { id: classId }
    });
    
    res.status(200).json({
      status: 'success',
      message: 'Class deleted successfully'
    });
  },
  
  createClassSchedule: async (req, res) => {
    const classId = parseInt(req.params.id);
    const { startTime, endTime, instructor } = req.body;
    
    // First check if class exists and is active
    const gymClass = await prisma.gymClass.findFirst({
      where: { 
        id: classId,
        isActive: true
      }
    });
    
    if (!gymClass) {
      throw new ApiError(404, 'Active class not found');
    }
    
    // Validate start time is before end time
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    
    if (startDate >= endDate) {
      throw new ApiError(400, 'Start time must be before end time');
    }
    
    // Check if there are any overlapping schedules for this class
    const overlappingSchedules = await prisma.classSchedule.findMany({
      where: {
        classId,
        OR: [
          {
            startTime: {
              lte: endDate
            },
            endTime: {
              gte: startDate
            }
          }
        ]
      }
    });
    
    if (overlappingSchedules.length > 0) {
      throw new ApiError(409, 'This schedule overlaps with an existing schedule for this class');
    }
    
    // Create the schedule
    const newSchedule = await prisma.classSchedule.create({
      data: {
        classId,
        startTime: startDate,
        endTime: endDate,
        instructor,
        currentBookings: 0,
        isCancelled: false
      }
    });
    
    res.status(201).json({
      status: 'success',
      message: 'Class schedule created successfully',
      data: newSchedule
    });
  },
  
  updateClassSchedule: async (req, res) => {
    const scheduleId = parseInt(req.params.id);
    
    // First check if schedule exists
    const schedule = await prisma.classSchedule.findUnique({
      where: { id: scheduleId },
      include: {
        gymClass: true
      }
    });
    
    if (!schedule) {
      throw new ApiError(404, 'Schedule not found');
    }
    
    // If changing dates, check for overlaps with other schedules
    if (req.body.startTime || req.body.endTime) {
      const startDate = req.body.startTime ? new Date(req.body.startTime) : schedule.startTime;
      const endDate = req.body.endTime ? new Date(req.body.endTime) : schedule.endTime;
      
      // Validate start time is before end time
      if (startDate >= endDate) {
        throw new ApiError(400, 'Start time must be before end time');
      }
      
      // Check for overlaps
      const overlappingSchedules = await prisma.classSchedule.findMany({
        where: {
          classId: schedule.classId,
          id: {
            not: scheduleId
          },
          OR: [
            {
              startTime: {
                lte: endDate
              },
              endTime: {
                gte: startDate
              }
            }
          ]
        }
      });
      
      if (overlappingSchedules.length > 0) {
        throw new ApiError(409, 'This schedule would overlap with an existing schedule for this class');
      }
    }
    
    // Special handling for cancellations
    let updateData = { ...req.body };
    
    if (req.body.isCancelled === true && !schedule.isCancelled) {
      // If cancelling a schedule that wasn't cancelled before
      
      // Notify users with bookings (this would be implemented in a real app)
      // await notifyUsers(scheduleId, 'cancellation');
      
      // Update booking statuses
      await prisma.userBooking.updateMany({
        where: {
          scheduleId,
          bookingStatus: 'confirmed'
        },
        data: {
          bookingStatus: 'cancelled',
          cancellationReason: 'Class cancelled by instructor/gym'
        }
      });
    }
    
    // Update the schedule
    const updatedSchedule = await prisma.classSchedule.update({
      where: { id: scheduleId },
      data: updateData
    });
    
    res.status(200).json({
      status: 'success',
      message: 'Schedule updated successfully',
      data: updatedSchedule
    });
  },
  
  deleteClassSchedule: async (req, res) => {
    const scheduleId = parseInt(req.params.id);
    
    // First check if schedule exists
    const schedule = await prisma.classSchedule.findUnique({
      where: { id: scheduleId },
      include: {
        _count: {
          select: {
            userBookings: true
          }
        }
      }
    });
    
    if (!schedule) {
      throw new ApiError(404, 'Schedule not found');
    }
    
    // Check if there are bookings for this schedule
    if (schedule._count.userBookings > 0) {
      // Mark as cancelled instead of deleting
      await prisma.classSchedule.update({
        where: { id: scheduleId },
        data: { 
          isCancelled: true,
          cancellationReason: 'Administratively cancelled'
        }
      });
      
      // Update bookings
      await prisma.userBooking.updateMany({
        where: {
          scheduleId,
          bookingStatus: 'confirmed'
        },
        data: {
          bookingStatus: 'cancelled',
          cancellationReason: 'Class cancelled by instructor/gym'
        }
      });
      
      return res.status(200).json({
        status: 'success',
        message: 'Schedule has been marked as cancelled as it has associated bookings'
      });
    }
    
    // If no bookings, perform a hard delete
    await prisma.classSchedule.delete({
      where: { id: scheduleId }
    });
    
    res.status(200).json({
      status: 'success',
      message: 'Schedule deleted successfully'
    });
  }
};

module.exports = { classController };