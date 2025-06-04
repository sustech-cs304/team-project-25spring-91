// src/controllers/dietEntry.controller.js
const { dietEntryService } = require('../services/dietEntry.service');

const dietEntryController = {
  getUserDietEntries: async (req, res) => {
    const userId = req.user.id;
    const { startDate, endDate, mealType, page = 1, limit = 20 } = req.query;

    const result = await dietEntryService.getUserDietEntries(userId, {
      startDate,
      endDate,
      mealType,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.status(200).json({
      status: 'success',
      results: result.dietEntries.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: result.totalPages,
        totalItems: result.totalItems,
      },
      data: result.dietEntries,
    });
  },

  // New: Get all user's diet entries (no pagination)
  getAllUserDietEntries: async (req, res) => {
    const userId = req.user.id;
    const { startDate, endDate, mealType } = req.query;

    const dietEntries = await dietEntryService.getAllUserDietEntries(userId, {
      startDate,
      endDate,
      mealType,
    });

    res.status(200).json({
      status: 'success',
      results: dietEntries.length,
      data: dietEntries,
    });
  },

  getDietEntryById: async (req, res) => {
    const userId = req.user.id;
    const entryId = parseInt(req.params.id);

    const dietEntry = await dietEntryService.getDietEntryById(entryId, userId);

    res.status(200).json({
      status: 'success',
      data: dietEntry,
    });
  },

  createDietEntry: async (req, res) => {
    const userId = req.user.id;

    const dietEntry = await dietEntryService.createDietEntry(userId, req.body);

    res.status(201).json({
      status: 'success',
      message: 'Diet entry created successfully',
      data: dietEntry,
    });
  },

  updateDietEntry: async (req, res) => {
    const userId = req.user.id;
    const entryId = parseInt(req.params.id);

    const updatedEntry = await dietEntryService.updateDietEntry(
      entryId,
      userId,
      req.body,
    );

    res.status(200).json({
      status: 'success',
      message: 'Diet entry updated successfully',
      data: updatedEntry,
    });
  },

  deleteDietEntry: async (req, res) => {
    const userId = req.user.id;
    const entryId = parseInt(req.params.id);

    await dietEntryService.deleteDietEntry(entryId, userId);

    res.status(200).json({
      status: 'success',
      message: 'Diet entry deleted successfully',
    });
  },

  getUserDietSummary: async (req, res) => {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const summary = await dietEntryService.getUserDietSummary(userId, {
      startDate,
      endDate,
    });

    res.status(200).json({
      status: 'success',
      data: summary,
    });
  },
  getMonthlyCalorieConsumption: async (req, res) => {
    const userId = req.user.id;
    // The Zod transform handles default, so req.query.months will be a number or undefined
    // If undefined, the service default will apply.
    const months = req.query.months ? parseInt(req.query.months) : undefined;


    const monthlyData = await dietEntryService.getMonthlyCalorieConsumption(userId, months);

    res.status(200).json({
      status: 'success',
      data: monthlyData,
    });
  },
};

module.exports = { dietEntryController };
