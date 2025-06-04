// src/validators/diet.validator.js
const { z } = require('zod');

const dietSchemas = {
  // Food Item Schemas (no changes here, keeping for context)
  createFoodItem: z.object({
    body: z.object({
      name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name cannot exceed 100 characters'),
      description: z.string().optional(),
      caloriesPerUnit: z
        .number({
          required_error: 'Calories per unit is required',
        })
        .positive('Calories must be positive'),
      servingUnit: z
        .string({
          required_error: 'Serving unit is required',
        })
        .min(1, 'Serving unit cannot be empty')
        .max(20, 'Serving unit cannot exceed 20 characters'),
      imageUrl: z.string().url('Invalid URL format').optional(),
    }),
    query: z.object({}).optional(),
    params: z.object({}).optional(),
  }),

  updateFoodItem: z.object({
    body: z.object({
      name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name cannot exceed 100 characters')
        .optional(),
      description: z.string().optional(),
      caloriesPerUnit: z.number().positive('Calories must be positive').optional(),
      servingUnit: z
        .string()
        .min(1, 'Serving unit cannot be empty')
        .max(20, 'Serving unit cannot exceed 20 characters')
        .optional(),
      imageUrl: z.string().url('Invalid URL format').optional().nullable(),
    }),
    query: z.object({}).optional(),
    params: z.object({
      id: z.string().refine((val) => !isNaN(parseInt(val)), {
        message: 'Food item ID must be a number',
      }),
    }),
  }),

  getFoodItem: z.object({
    params: z.object({
      id: z.string().refine((val) => !isNaN(parseInt(val)), {
        message: 'Food item ID must be a number',
      }),
    }),
    query: z.object({}).optional(),
    body: z.object({}).optional(),
  }),

  searchFoodItems: z.object({
    query: z.object({
      search: z.string().optional(),
      page: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 1)),
      limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 20)),
    }),
    body: z.object({}).optional(),
    params: z.object({}).optional(),
  }),

  // Diet Entry Schemas
  createDietEntry: z.object({
    body: z.object({
      foodId: z
        .number({
          required_error: 'Food item ID is required',
        })
        .int()
        .positive('Food item ID must be positive'),
      quantity: z
        .number({
          required_error: 'Quantity is required',
        })
        .positive('Quantity must be positive'),
      consumptionDate: z
        .string({
          required_error: 'Consumption date is required',
        })
        .refine((val) => !isNaN(Date.parse(val)), {
          message: 'Consumption date must be a valid date string',
        }),
      mealType: z // Allow any string, or default if not provided
        .string()
        .min(1, 'Meal type cannot be empty if provided')
        .max(50, 'Meal type cannot exceed 50 characters')
        .optional(),
      notes: z.string().max(500, 'Notes cannot exceed 500 characters').nullable().optional(), // Allow null or undefined
    }),
    query: z.object({}).optional(),
    params: z.object({}).optional(),
  }),

  updateDietEntry: z.object({
    body: z.object({
      foodId: z.number().int().positive('Food item ID must be positive').optional(),
      quantity: z.number().positive('Quantity must be positive').optional(),
      consumptionDate: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), {
          message: 'Consumption date must be a valid date string',
        })
        .optional(),
      mealType: z // Allow any string
        .string()
        .min(1, 'Meal type cannot be empty if provided')
        .max(50, 'Meal type cannot exceed 50 characters')
        .optional(),
      notes: z.string().max(500, 'Notes cannot exceed 500 characters').nullable().optional(), // Allow null or undefined
    }),
    query: z.object({}).optional(),
    params: z.object({
      id: z.string().refine((val) => !isNaN(parseInt(val)), {
        message: 'Diet entry ID must be a number',
      }),
    }),
  }),

  getDietEntry: z.object({
    params: z.object({
      id: z.string().refine((val) => !isNaN(parseInt(val)), {
        message: 'Diet entry ID must be a number',
      }),
    }),
    query: z.object({}).optional(),
    body: z.object({}).optional(),
  }),

  getUserDietEntries: z.object({ // This is for the paginated version
    query: z.object({
      startDate: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), {
          message: 'Start date must be a valid date string',
        })
        .optional(),
      endDate: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), {
          message: 'End date must be a valid date string',
        })
        .optional(),
      mealType: z.string().optional(), // Allow any string for filtering
      page: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 1)),
      limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 20)),
    }),
    body: z.object({}).optional(),
    params: z.object({}).optional(),
  }),

  // New schema for getting all diet entries (no pagination)
  getAllUserDietEntries: z.object({
    query: z.object({
      startDate: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), {
          message: 'Start date must be a valid date string',
        })
        .optional(),
      endDate: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), {
          message: 'End date must be a valid date string',
        })
        .optional(),
      mealType: z.string().optional(), // Allow any string for filtering
    }),
    body: z.object({}).optional(),
    params: z.object({}).optional(),
  }),

  getUserDietSummary: z.object({
    query: z.object({
      startDate: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), {
          message: 'Start date must be a valid date string',
        })
        .optional(),
      endDate: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), {
          message: 'End date must be a valid date string',
        })
        .optional(),
    }),
    body: z.object({}).optional(),
    params: z.object({}).optional(),
  }),
  getMonthlyCaloriesConsumedQuery: z.object({
    query: z.object({
      months: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 12)) // Default to last 12 months
        .refine((val) => val > 0 && val <= 60, { // Limit to a reasonable range, e.g., 5 years
          message: 'Months must be between 1 and 60',
        }),
    }),
  }),
};


module.exports = { dietSchemas };
