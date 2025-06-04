//src/controllers/actual.controller.js
const { actualService } = require('../services/actual.service');

const actualController = {
  getAllActualWorkouts: async (req, res) => {
    const userId = req.user.id;
    const workouts = await actualService.getAllActualWorkouts(userId);
    
    res.status(200).json({
      status: 'success',
      results: workouts.length,
      data: workouts
    });
  },
  
  getWorkoutHistory: async (req, res) => {
    const userId = req.user.id;
    const { startDate, endDate, limit = 10, page = 1 } = req.query;
    
    const history = await actualService.getWorkoutHistory(
      userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      parseInt(limit),
      parseInt(page)
    );
    
    res.status(200).json({
      status: 'success',
      results: history.workouts.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: history.totalPages,
        totalItems: history.totalItems
      },
      data: history.workouts
    });
  },
  
  getPlannedVsActualComparison: async (req, res) => {
    const userId = req.user.id;
    const comparisonData = await actualService.getPlannedVsActualComparison(userId);
    
    res.status(200).json({
      status: 'success',
      data: comparisonData
    });
  },
  
  getActualWorkoutById: async (req, res) => {
    const userId = req.user.id;
    const workoutId = parseInt(req.params.id);
    
    const workout = await actualService.getActualWorkoutById(userId, workoutId);
    
    res.status(200).json({
      status: 'success',
      data: workout
    });
  },
  
  createActualWorkout: async (req, res) => {
    const userId = req.user.id;
    const workoutData = {
      ...req.body,
      userId
    };
    
    const newWorkout = await actualService.createActualWorkout(workoutData);
    
    res.status(201).json({
      status: 'success',
      message: 'Workout logged successfully',
      data: newWorkout
    });
  },
  
  createFromPlannedWorkout: async (req, res) => {
    const userId = req.user.id;
    const plannedId = parseInt(req.params.plannedId);
    const workoutData = {
      ...req.body,
      userId,
      plannedId
    };
    
    const newWorkout = await actualService.createFromPlannedWorkout(workoutData);
    
    res.status(201).json({
      status: 'success',
      message: 'Workout logged successfully from planned workout',
      data: newWorkout
    });
  },
  
  updateActualWorkout: async (req, res) => {
    const userId = req.user.id;
    const workoutId = parseInt(req.params.id);
    const updateData = req.body;
    
    const updatedWorkout = await actualService.updateActualWorkout(userId, workoutId, updateData);
    
    res.status(200).json({
      status: 'success',
      message: 'Workout log updated successfully',
      data: updatedWorkout
    });
  },
  
  deleteActualWorkout: async (req, res) => {
    const userId = req.user.id;
    const workoutId = parseInt(req.params.id);
    
    await actualService.deleteActualWorkout(userId, workoutId);
    
    res.status(200).json({
      status: 'success',
      message: 'Workout log deleted successfully'
    });
  },

  getMonthlyCalorieBurn: async (req, res) => {
    const userId = req.user.id;
    const months = req.query.months ? parseInt(req.query.months) : 12; // Default to 12 if not provided

    const monthlyData = await actualService.getMonthlyCalorieBurn(userId, months);

    res.status(200).json({
      status: 'success',
      data: monthlyData,
    });
  }

};

module.exports = { actualController };