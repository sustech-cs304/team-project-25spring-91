// src/routes/gym.routes.js
const express = require('express');
const { validate } = require('../middleware/validate');
const { gymController } = require('../controllers/gym.controller');
const { gymSchemas } = require('../validators/gym.validator');
const { asyncHandler } = require('../utils/asyncHandler');
const { authMiddleware } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const { ownershipCheck } = require('../middleware/ownershipCheck');
const { uploadGymImage, processGymImage } = require('../middleware/upload');

const {
  membershipPlanController,
} = require('../controllers/membershipPlan.controller');
const {
  membershipPlanSchemas,
} = require('../validators/membershipPlan.validator');

const router = express.Router();

// --- Public routes ---
router.get(
    '/',
    validate(gymSchemas.listAllGymsQuery), // Apply validation
    asyncHandler(gymController.getAllGyms)
  );

router.get(
  '/:id',
  validate(gymSchemas.getGym),
  asyncHandler(gymController.getGymById),
);

// --- Protected routes ---
router.use(authMiddleware);

// New route for admins to get total gym count
router.get(
  '/statistics/total-count', // A more descriptive path for statistics
  roleCheck(['admin']),
  asyncHandler(gymController.getTotalGymCount),
);

router.get(
  '/all/user-view',
  roleCheck(['admin', 'gym_owner', 'user']),
  asyncHandler(gymController.getAllGymsAdmin),
);

router.get(
  '/owned/my-gyms',
  roleCheck(['gym_owner', 'admin']),
  asyncHandler(gymController.getMyGyms),
);

router.get(
  '/:id/classes',
  validate(gymSchemas.getGym),
  asyncHandler(gymController.getGymClasses),
);

router.get(
  '/:id/membership-plans',
  validate(gymSchemas.getGym),
  asyncHandler(membershipPlanController.getMembershipPlansByGym),
);

// --- Admin and gym owner only routes for CREATION ---
router.post(
  '/',
  roleCheck(['admin', 'gym_owner']),
  uploadGymImage,
  processGymImage,
  validate(gymSchemas.createGym),
  asyncHandler(gymController.createGym),
);

router.post(
  '/:gymId/membership-plans',
  roleCheck(['admin', 'gym_owner']),
  validate(membershipPlanSchemas.createMembershipPlan),
  asyncHandler(membershipPlanController.createMembershipPlan),
);

// --- Admin or RESOURCE OWNER only routes for MODIFICATION ---
router.put(
  '/:id',
  ownershipCheck('gym'),
  uploadGymImage,
  processGymImage,
  validate(gymSchemas.updateGym),
  asyncHandler(gymController.updateGym),
);

router.delete(
  '/:id',
  roleCheck(['admin']),
  validate(gymSchemas.deleteGym),
  asyncHandler(gymController.deleteGym),
);

module.exports = router;
