// src/routes/users.routes.js
const express = require('express');
const { validate } = require('../middleware/validate');
const { userController } = require('../controllers/users.controller');
const { userSchemas } = require('../validators/users.validator');
const { authMiddleware } = require('../middleware/auth'); // Already here
const { asyncHandler } = require('../utils/asyncHandler');
const { roleCheck } = require('../middleware/roleCheck');
const { uploadUserImage, processUserImage } = require('../middleware/upload');

const router = express.Router();

// These routes are already protected by authMiddleware in src/index.js
// app.use('/api/users', authMiddleware, userRoutes);
// So, individual authMiddleware here is redundant unless a specific route under /api/users was public.

router.get('/profile', asyncHandler(userController.getProfile));

router.put(
  '/profile',
  uploadUserImage,
  processUserImage,
  validate(userSchemas.updateProfile),
  asyncHandler(userController.updateProfile),
);

router.put(
  '/profile/image',
  uploadUserImage,
  processUserImage,
  asyncHandler(userController.updateProfileImage),
);

router.get('/stats', asyncHandler(userController.getWorkoutStats));

// --- Admin-only routes ---
// The authMiddleware is applied at the router level in index.js,
// so roleCheck is sufficient here.

router.get(
  '/admin/all-users',
  roleCheck(['admin']), // Only admins can list all users
  asyncHandler(userController.getAllUsers),
);

router.put(
  '/admin/change-role/:id',
  roleCheck(['admin']), // Only admins can change roles
  validate(userSchemas.changeRole),
  asyncHandler(userController.changeUserRole),
);

// New Admin Statistics Routes
router.get(
  '/admin/statistics/counts',
  roleCheck(['admin']),
  asyncHandler(userController.getUserCounts),
);

router.get(
  '/admin/statistics/monthly-signups',
  roleCheck(['admin']),
  asyncHandler(userController.getNewUserSignups),
);

router.get(
  '/gym-owner/dashboard-stats', // New route for gym owner
  roleCheck(['gym_owner']), // Only gym_owner can access
  asyncHandler(userController.getGymOwnerDashboardStats),
);

module.exports = router;
