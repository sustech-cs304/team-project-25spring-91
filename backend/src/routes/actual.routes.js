// src/routes/actual.routes.js
const express = require('express');
const { validate } = require('../middleware/validate');
const { actualController } = require('../controllers/actual.controller');
const { actualSchemas } = require('../validators/actual.validator');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.get(
  '/',
  asyncHandler(actualController.getAllActualWorkouts)
);

router.get(
  '/history',
  validate(actualSchemas.getHistory),
  asyncHandler(actualController.getWorkoutHistory)
);

router.get(
  '/comparison',
  asyncHandler(actualController.getPlannedVsActualComparison)
);

router.get(
  '/monthly-calories',
  validate(actualSchemas.getMonthlyCaloriesQuery), // Validate query params
  asyncHandler(actualController.getMonthlyCalorieBurn),
);

router.get(
  '/:id',
  validate(actualSchemas.getActualWorkout),
  asyncHandler(actualController.getActualWorkoutById)
);

router.post(
  '/',
  validate(actualSchemas.createActualWorkout),
  asyncHandler(actualController.createActualWorkout)
);

router.post(
  '/from-planned/:plannedId',
  validate(actualSchemas.createFromPlanned),
  asyncHandler(actualController.createFromPlannedWorkout)
);

router.put(
  '/:id',
  validate(actualSchemas.updateActualWorkout),
  asyncHandler(actualController.updateActualWorkout)
);

router.delete(
  '/:id',
  validate(actualSchemas.deleteActualWorkout),
  asyncHandler(actualController.deleteActualWorkout)
);

module.exports = router;