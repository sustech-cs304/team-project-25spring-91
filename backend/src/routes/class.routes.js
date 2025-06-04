// src/routes/class.routes.js
const express = require('express');
const { validate } = require('../middleware/validate');
const { classController } = require('../controllers/class.controller');
const { classSchemas } = require('../validators/class.validator');
const { asyncHandler } = require('../utils/asyncHandler');
const { authMiddleware } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const { ownershipCheck } = require('../middleware/ownershipCheck');
const { uploadGymClassImage, processGymClassImage } = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get(
    '/',
    validate(classSchemas.listAllGymClassesQuery), // Apply validation
    asyncHandler(classController.getAllGymClasses)
  );
router.get(
  '/:id',
  validate(classSchemas.getClass),
  asyncHandler(classController.getGymClassById)
);

// Protected routes
router.use(authMiddleware);

router.get(
  '/:id/schedules',
  validate(classSchemas.getClass),
  asyncHandler(classController.getClassSchedules)
);

// Admin and gym owner routes
router.post(
  '/',
  roleCheck(['admin', 'gym_owner']),
  uploadGymClassImage,
  processGymClassImage,
  validate(classSchemas.createClass),
  asyncHandler(classController.createClass)
);

// Admin or resource owner only routes
router.put(
  '/:id',
  ownershipCheck('gymClass'),
  uploadGymClassImage,
  processGymClassImage,
  validate(classSchemas.updateClass),
  asyncHandler(classController.updateClass)
);

router.delete(
  '/:id',
  ownershipCheck('gymClass'),
  validate(classSchemas.deleteClass),
  asyncHandler(classController.deleteClass)
);

// Schedule management routes remain the same...
router.post(
  '/:id/schedules',
  ownershipCheck('gymClass'),
  validate(classSchemas.createSchedule),
  asyncHandler(classController.createClassSchedule)
);

router.put(
  '/schedules/:id',
  ownershipCheck('classSchedule'),
  validate(classSchemas.updateSchedule),
  asyncHandler(classController.updateClassSchedule)
);

router.delete(
  '/schedules/:id',
  ownershipCheck('classSchedule'),
  validate(classSchemas.deleteSchedule),
  asyncHandler(classController.deleteClassSchedule)
);

module.exports = router;    