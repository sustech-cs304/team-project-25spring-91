// src/routes/dietEntry.routes.js
const express = require('express');
const { dietEntryController } = require('../controllers/dietEntry.controller');
const { validate } = require('../middleware/validate');
const { dietSchemas } = require('../validators/diet.validator');
const { asyncHandler } = require('../utils/asyncHandler');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// Get user's diet entries (paginated)
router.get(
  '/',
  validate(dietSchemas.getUserDietEntries), // Uses the paginated schema
  asyncHandler(dietEntryController.getUserDietEntries),
);

// New: Get all user's diet entries (no pagination)
router.get(
  '/all', // New route path
  validate(dietSchemas.getAllUserDietEntries), // Uses the non-paginated schema
  asyncHandler(dietEntryController.getAllUserDietEntries),
);

router.get(
  '/summary',
  validate(dietSchemas.getUserDietSummary),
  asyncHandler(dietEntryController.getUserDietSummary),
);

router.get(
  '/monthly-calories-consumed',
  validate(dietSchemas.getMonthlyCaloriesConsumedQuery), // Validate query params
  asyncHandler(dietEntryController.getMonthlyCalorieConsumption),
);

router.get(
  '/:id',
  validate(dietSchemas.getDietEntry),
  asyncHandler(dietEntryController.getDietEntryById),
);

router.post(
  '/',
  validate(dietSchemas.createDietEntry),
  asyncHandler(dietEntryController.createDietEntry),
);

router.put(
  '/:id',
  validate(dietSchemas.updateDietEntry),
  asyncHandler(dietEntryController.updateDietEntry),
);

router.delete(
  '/:id',
  validate(dietSchemas.getDietEntry), // Schema for getting by ID is fine for delete param validation
  asyncHandler(dietEntryController.deleteDietEntry),
);

module.exports = router;
