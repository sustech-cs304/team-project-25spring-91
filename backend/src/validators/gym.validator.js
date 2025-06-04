// src/validators/gym.validator.js
const { z } = require('zod');

const gymSchemas = {
  getGym: z.object({
    params: z.object({
      id: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'Gym ID must be a number'
      })
    })
  }),

listAllGymsQuery: z.object({
      search: z.string().optional(),
      page: z.string().optional().transform(val => (val ? parseInt(val) : 1)),
      limit: z.string().optional().transform(val => (val ? parseInt(val) : 10)),
      paginate: z.string().optional().transform(val => val !== 'false'), // Defaults to true if not 'false'
    }),
  
  createGym: z.object({
    body: z.object({
      name: z.string({
        required_error: 'Name is required'
      }).min(1, 'Name cannot be empty'),
      address: z.string().optional(),
      description: z.string().optional(),
      contactInfo: z.string().optional(),
      imageUrl: z.string().optional()
    })
  }),
  
  updateGym: z.object({
    params: z.object({
      id: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'Gym ID must be a number'
      })
    }),
    body: z.object({
      name: z.string().optional(),
      address: z.string().optional(),
      description: z.string().optional(),
      contactInfo: z.string().optional(),
      imageUrl: z.string().optional()
    }).refine(data => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update'
    })
  }),
  
  deleteGym: z.object({
    params: z.object({
      id: z.string().refine(val => !isNaN(parseInt(val)), {
        message: 'Gym ID must be a number'
      })
    })
  }),

  
};

module.exports = { gymSchemas };