// src/validators/actual.validator.js
/** 
     * AI-generated-content 
     * tool: ChatGPT4o-mini
     * usage: Validation is written by AI because depend on our api feature, AI can detect edge case scenarios better than human, so I let AI to validate 
     */ 
const { z } = require('zod');

const actualSchemas = {
  getActualWorkout: z.object({
    params: z.object({
      id: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'Workout ID must be a number'
      })
    })
  }),
  
  getHistory: z.object({
    query: z.object({
      startDate: z.string().refine(val => !val || !isNaN(Date.parse(val)), {
        message: 'Invalid start date format'
      }).optional(),
      endDate: z.string().refine(val => !val || !isNaN(Date.parse(val)), {
        message: 'Invalid end date format'
      }).optional(),
      limit: z.string().refine(val => !val || !isNaN(parseInt(val)), {
        message: 'Limit must be a number'
      }).optional(),
      page: z.string().refine(val => !val || !isNaN(parseInt(val)), {
        message: 'Page must be a number'
      }).optional()
    })
  }),
  
  createActualWorkout: z.object({
    body: z.object({
      title: z.string().min(2, 'Workout title must be at least 2 characters'),
      completedDate: z.string().refine(val => !isNaN(Date.parse(val)), {
        message: 'Invalid date format'
      }),
      completedTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'Time format should be HH:MM'
      }).optional(),
      plannedId: z.number().int().positive().optional(),
      actualDuration: z.number().int().positive().optional(),
      exercises: z.array(
        z.object({
          exerciseId: z.number().int().positive(),
          plannedExerciseId: z.number().int().positive().optional(),
          actualSets: z.number().int().positive().optional(),
          actualReps: z.number().int().positive().optional(),
          actualWeight: z.number().positive().optional(),
          actualDuration: z.number().int().positive().optional(),
          actualCalories: z.number().int().positive().optional()
        })
      ).min(1, 'At least one exercise is required')
    })
  }),
  
  createFromPlanned: z.object({
    params: z.object({
      plannedId: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'Planned workout ID must be a number'
      })
    }),
    body: z.object({
      completedDate: z.string().refine(val => !isNaN(Date.parse(val)), {
        message: 'Invalid date format'
      }),
      completedTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'Time format should be HH:MM'
      }).optional(),
      actualDuration: z.number().int().positive().optional(),
      exercises: z.array(
        z.object({
          plannedExerciseId: z.number().int().positive(),
          exerciseId: z.number().int().positive(),
          actualSets: z.number().int().positive().optional(),
          actualReps: z.number().int().positive().optional(),
          actualWeight: z.number().positive().optional(),
          actualDuration: z.number().int().positive().optional()
        })
      ).optional()
    })
  }),
  
  updateActualWorkout: z.object({
    params: z.object({
      id: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'Workout ID must be a number'
      })
    }),
    body: z.object({
      title: z.string().min(2).optional(),
      completedDate: z.string().refine(val => !val || !isNaN(Date.parse(val)), {
        message: 'Invalid date format'
      }).optional(),
      completedTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'Time format should be HH:MM'
      }).optional(),
      actualDuration: z.number().int().positive().optional(),
      exercises: z.array(
        z.object({
          id: z.number().int().positive().optional(), // For updating existing
          exerciseId: z.number().int().positive(),
          plannedExerciseId: z.number().int().positive().optional(),
          actualSets: z.number().int().positive().optional(),
          actualReps: z.number().int().positive().optional(),
          actualWeight: z.number().positive().optional(),
          actualDuration: z.number().int().positive().optional(),
          actualCalories: z.number().int().positive().optional() 
        })
      ).optional()
    })
  }),
  
  deleteActualWorkout: z.object({
    params: z.object({
      id: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'Workout ID must be a number'
      })
    })
  }),
  getMonthlyCaloriesQuery: z.object({
    query: z.object({
      months: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 12)) // Default to last 12 months
        .refine((val) => val > 0 && val <= 60, { // Limit to a reasonable range, e.g., 5 years
          message: 'Months must be between 1 and 60',
        }),
    }),
  })
};

module.exports = { actualSchemas };