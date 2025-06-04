// src/validators/class.validator.js
const { z } = require('zod');

const classSchemas = {

  getClass: z.object({
    params: z.object({
      id: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'Class ID must be a number'
      })
    })
  }),

  listAllGymClassesQuery: z.object({
      gymId: z.string().optional().transform(val => (val ? parseInt(val) : undefined)),
      difficultyLevel: z.string().optional(),
      search: z.string().optional(),
      page: z.string().optional().transform(val => (val ? parseInt(val) : 1)),
      limit: z.string().optional().transform(val => (val ? parseInt(val) : 10)),
      paginate: z.string().optional().transform(val => val !== 'false'), // Defaults to true
    }),
  
  createClass: z.object({
    body: z.object({
      gymId: z.number({
        required_error: 'Gym ID is required'
      }).int().positive('Gym ID must be a positive integer'),
      name: z.string({
        required_error: 'Name is required'
      }).min(1, 'Name cannot be empty'),
      description: z.string().optional(),
      maxCapacity: z.number().int().positive().optional(),
      durationMinutes: z.number().int().positive({
        message: 'Duration must be a positive number of minutes'
      }),
      membersOnly: z.boolean().optional().default(false),
      difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
      imageUrl: z.string().url().optional(),
      isActive: z.boolean().optional().default(true)
    })
  }),
  
  updateClass: z.object({
    params: z.object({
      id: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'Class ID must be a number'
      })
    }),
    body: z.object({
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      maxCapacity: z.number().int().positive().optional(),
      durationMinutes: z.number().int().positive().optional(),
      membersOnly: z.boolean().optional(),
      difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
      imageUrl: z.string().url().optional(),
      isActive: z.boolean().optional()
    }).refine(data => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update'
    })
  }),
  
  deleteClass: z.object({
    params: z.object({
      id: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'Class ID must be a number'
      })
    })
  }),
  
  createSchedule: z.object({
    params: z.object({
      id: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'Class ID must be a number'
      })
    }),
    body: z.object({
      startTime: z.string().datetime({
        message: 'Start time must be a valid ISO datetime string'
      }),
      endTime: z.string().datetime({
        message: 'End time must be a valid ISO datetime string'
      }),
      instructor: z.string().optional()
    })
  }),
  
  updateSchedule: z.object({
    params: z.object({
      id: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'Schedule ID must be a number'
      })
    }),
    body: z.object({
      startTime: z.string().datetime().optional(),
      endTime: z.string().datetime().optional(),
      instructor: z.string().optional(),
      isCancelled: z.boolean().optional(),
      cancellationReason: z.string().optional()
    }).refine(data => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update'
    })
  }),
  
  deleteSchedule: z.object({
    params: z.object({
      id: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'Schedule ID must be a number'
      })
    })
  })
};

module.exports = { classSchemas };