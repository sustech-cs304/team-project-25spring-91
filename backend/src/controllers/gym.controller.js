// src/controllers/gym.controller.js
const prisma = require('../config/prisma');
const { gymService } = require('../services/gym.service');
const { ApiError } = require('../utils/ApiError');
const fs = require('fs').promises;
const path = require('path');

// ... (getAllGyms, getAllGymsAdmin, getMyGyms, getGymById, etc. remain the same) ...
const getAllGyms = async (req, res) => {
    // Use validated query params if validator is applied, otherwise parse directly
    const { search, page, limit, paginate } = req.query;

    const result = await gymService.getAllGyms({
      search,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      paginate: paginate !== 'false', // Convert "false" string to boolean false
    });

    if (!result.paginationApplied) {
      res.status(200).json({
        status: 'success',
        results: result.totalItems,
        data: result.gyms,
      });
    } else {
      res.status(200).json({
        status: 'success',
        results: result.gyms.length,
        pagination: {
          page: page ? parseInt(page) : 1,
          limit: limit ? parseInt(limit) : 10,
          totalPages: result.totalPages,
          totalItems: result.totalItems,
        },
        data: result.gyms,
      });
    }
  };

const getAllGymsAdmin = async (req, res) => {
  const gyms = await gymService.getAllGymsAdmin();
  res.status(200).json({
    status: 'success',
    results: gyms.length,
    data: gyms,
  });
};

const getMyGyms = async (req, res) => {
  const ownerId = req.user.id;
  const { search, page = 1, limit = 10 } = req.query;

  const result = await gymService.getMyGyms({
    ownerId,
    search,
    page: parseInt(page),
    limit: parseInt(limit),
  });

  res.status(200).json({
    status: 'success',
    results: result.gyms.length,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: result.totalPages,
      totalItems: result.totalItems,
    },
    data: result.gyms,
  });
};

const getGymById = async (req, res) => {
  const gymId = parseInt(req.params.id);
  const gym = await gymService.getGymById(gymId);
  res.status(200).json({
    status: 'success',
    data: gym,
  });
};

const getGymClasses = async (req, res) => {
  const gymId = parseInt(req.params.id);
  const classes = await gymService.getGymClasses(gymId);
  res.status(200).json({
    status: 'success',
    results: classes.length,
    data: classes,
  });
};

const getGymMembershipPlans = async (req, res) => {
  const gymId = parseInt(req.params.id);
  const plans = await gymService.getGymMembershipPlans(gymId);
  res.status(200).json({
    status: 'success',
    results: plans.length,
    data: plans,
  });
};

const createGym = async (req, res) => {
  const userId = req.user.id;
  let ownerIdToSet = null;
  if (req.user.role === 'gym_owner') {
    ownerIdToSet = userId;
  } else if (req.user.role === 'admin' && req.body.ownerId) {
    ownerIdToSet = parseInt(req.body.ownerId);
  } else if (req.user.role === 'admin' && !req.body.ownerId) {
    ownerIdToSet = userId;
  }

  const gymData = {
    ...req.body,
    ownerId: ownerIdToSet,
    imageUrl: req.processedImage ? req.processedImage.url : null,
  };

  if (req.user.role === 'gym_owner') {
    delete gymData.ownerId;
    gymData.ownerId = userId;
  }

  const newGym = await prisma.gym.create({
    data: gymData,
  });

  res.status(201).json({
    status: 'success',
    message: 'Gym created successfully',
    data: newGym,
  });
};

const updateGym = async (req, res) => {
  const gymId = parseInt(req.params.id);
  const gym = await prisma.gym.findUnique({
    where: { id: gymId },
  });

  if (!gym) {
    throw new ApiError(404, 'Gym not found');
  }

  const updateData = { ...req.body };
  if (req.processedImage) {
    if (gym.imageUrl) {
      try {
        const oldFilename = gym.imageUrl.split('/').pop();
        const oldFilepath = path.join(
          __dirname,
          '../../uploads/gyms',
          oldFilename,
        );
        await fs.unlink(oldFilepath);
      } catch (error) {
        console.log('Old image not found or already deleted:', error.message);
      }
    }
    updateData.imageUrl = req.processedImage.url;
  }

  if (req.user.role === 'gym_owner' && updateData.ownerId) {
    delete updateData.ownerId;
  }

  const updatedGym = await prisma.gym.update({
    where: { id: gymId },
    data: updateData,
  });

  res.status(200).json({
    status: 'success',
    message: 'Gym updated successfully',
    data: updatedGym,
  });
};

const deleteGym = async (req, res) => {
  const gymId = parseInt(req.params.id);
  const gym = await prisma.gym.findUnique({
    where: { id: gymId },
  });

  if (!gym) {
    throw new ApiError(404, 'Gym not found');
  }

  if (gym.imageUrl) {
    try {
      const filename = gym.imageUrl.split('/').pop();
      const filepath = path.join(__dirname, '../../uploads/gyms', filename);
      await fs.unlink(filepath);
    } catch (error) {
      console.log('Image not found or already deleted:', error.message);
    }
  }

  await prisma.gym.delete({
    where: { id: gymId },
  });

  res.status(200).json({
    status: 'success',
    message: 'Gym deleted successfully',
  });
};

// New controller for getting total gym count
const getTotalGymCount = async (req, res) => {
  const count = await gymService.getTotalGymCount();
  res.status(200).json({
    status: 'success',
    data: {
      totalGyms: count,
    },
  });
};

const gymController = {
  getAllGyms,
  getAllGymsAdmin,
  getMyGyms,
  getGymById,
  getGymClasses,
  getGymMembershipPlans,
  createGym,
  updateGym,
  deleteGym,
  getTotalGymCount, // Export the new controller
};

module.exports = { gymController };
