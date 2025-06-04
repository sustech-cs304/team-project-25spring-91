//tests/actualWorkout.test.js
const request = require('supertest');
const app = require('../src/app');
const { getAuthHeader } = require('./utils/auth');

describe('Actual Workouts Routes', () => {
  describe('GET /api/actual-workouts', () => {
    it('should get user actual workouts', async () => {
      // Create an actual workout first
      await global.prisma.actualWorkout.create({
        data: {
          userId: global.testUsers.user.id,
          title: 'Completed Workout',
          completedDate: new Date(),
          actualDuration: 45,
          actualExercises: {
            create: [
              {
                exerciseId: global.testExercises.pushup.id,
                actualSets: 3,
                actualReps: 10
              }
            ]
          }
        }
      });

      const response = await request(app)
        .get('/api/actual-workouts')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.results).toBe(response.body.data.length);
    });
  });

  describe('POST /api/actual-workouts', () => {
    it('should create actual workout', async () => {
      const workoutData = {
        title: 'Morning Workout Completed',
        completedDate: new Date().toISOString(),
        completedTime: '08:30',
        actualDuration: 40,
        exercises: [
          {
            exerciseId: global.testExercises.pushup.id,
            actualSets: 3,
            actualReps: 12,
            actualWeight: 10
          },
          {
            exerciseId: global.testExercises.running.id,
            actualDuration: 20,
            actualCalories: 200
          }
        ]
      };

      const response = await request(app)
        .post('/api/actual-workouts')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send(workoutData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Workout logged successfully');
      expect(response.body.data.title).toBe(workoutData.title);
      expect(response.body.data.actualExercises).toHaveLength(2);
    });

    it('should create actual workout from planned workout', async () => {
      // First create a planned workout
      const plannedWorkout = await global.prisma.plannedWorkout.create({
        data: {
          userId: global.testUsers.user.id,
          title: 'Planned Morning Workout',
          scheduledDate: new Date(),
          estimatedDuration: 45,
          plannedExercises: {
            create: [
              {
                exerciseId: global.testExercises.pushup.id,
                plannedSets: 3,
                plannedReps: 10
              }
            ]
          }
        }
      });

      const workoutData = {
        title: 'Completed Planned Workout',
        completedDate: new Date().toISOString(),
        actualDuration: 40,
        plannedId: plannedWorkout.id,
        exercises: [
          {
            exerciseId: global.testExercises.pushup.id,
            actualSets: 3,
            actualReps: 12
          }
        ]
      };

      const response = await request(app)
        .post('/api/actual-workouts')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send(workoutData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.plannedId).toBe(plannedWorkout.id);
    });
  });

  describe('POST /api/actual-workouts/from-planned/:plannedId', () => {
    it('should create actual workout from planned workout', async () => {
      // Create a planned workout
      const plannedWorkout = await global.prisma.plannedWorkout.create({
        data: {
          userId: global.testUsers.user.id,
          title: 'Planned Workout',
          scheduledDate: new Date(),
          estimatedDuration: 45,
          plannedExercises: {
            create: [
              {
                exerciseId: global.testExercises.pushup.id,
                plannedSets: 3,
                plannedReps: 10
              }
            ]
          }
        }
      });

      const workoutData = {
        completedDate: new Date().toISOString(),
        actualDuration: 40
      };

      const response = await request(app)
        .post(`/api/actual-workouts/from-planned/${plannedWorkout.id}`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send(workoutData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Workout logged successfully from planned workout');
      expect(response.body.data.plannedId).toBe(plannedWorkout.id);
    });

    it('should return 404 for non-existent planned workout', async () => {
      const workoutData = {
        completedDate: new Date().toISOString(),
        actualDuration: 40
      };

      const response = await request(app)
        .post('/api/actual-workouts/from-planned/999999')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send(workoutData)
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Planned workout not found');
    });
  });

  describe('GET /api/actual-workouts/history', () => {
    it('should get workout history with pagination', async () => {
      const response = await request(app)
        .get('/api/actual-workouts/history?page=1&limit=10')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
    });

    it('should filter by date range', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      const endDate = new Date();

      const response = await request(app)
        .get(`/api/actual-workouts/history?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(200);

      expect(response.body.status).toBe('success');
    });
  });
});

// Add these test cases to the existing file

describe('GET /api/actual-workouts/comparison', () => {
  it('should get planned vs actual comparison', async () => {
    const response = await request(app)
      .get('/api/actual-workouts/comparison')
      .set('Authorization', getAuthHeader(global.testUsers.user))
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data.adherenceRate).toBeDefined();
    expect(response.body.data.workouts).toBeInstanceOf(Array);
  });
});

describe('PUT /api/actual-workouts/:id', () => {
  it('should update actual workout', async () => {
    const workout = await global.prisma.actualWorkout.create({
      data: {
        userId: global.testUsers.user.id,
        title: 'Workout to Update',
        completedDate: new Date(),
        actualDuration: 30
      }
    });

    const updateData = {
      title: 'Updated Workout Title',
      actualDuration: 45
    };

    const response = await request(app)
      .put(`/api/actual-workouts/${workout.id}`)
      .set('Authorization', getAuthHeader(global.testUsers.user))
      .send(updateData)
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data.title).toBe(updateData.title);
  });

  it('should return 404 for workout belonging to another user', async () => {
    const workout = await global.prisma.actualWorkout.create({
      data: {
        userId: global.testUsers.admin.id,
        title: 'Other User Workout',
        completedDate: new Date(),
        actualDuration: 30
      }
    });

    const updateData = {
      title: 'Should not update'
    };

    const response = await request(app)
      .put(`/api/actual-workouts/${workout.id}`)
      .set('Authorization', getAuthHeader(global.testUsers.user))
      .send(updateData)
      .expect(404);

    expect(response.body.status).toBe('error');
  });
});

describe('DELETE /api/actual-workouts/:id', () => {
  it('should delete actual workout', async () => {
    const workout = await global.prisma.actualWorkout.create({
      data: {
        userId: global.testUsers.user.id,
        title: 'Workout to Delete',
        completedDate: new Date(),
        actualDuration: 30
      }
    });

    const response = await request(app)
      .delete(`/api/actual-workouts/${workout.id}`)
      .set('Authorization', getAuthHeader(global.testUsers.user))
      .expect(200);

    expect(response.body.status).toBe('success');

    // Verify deletion
    const deletedWorkout = await global.prisma.actualWorkout.findUnique({
      where: { id: workout.id }
    });
    expect(deletedWorkout).toBeNull();
  });
});

// Add after the existing DELETE test
describe('GET /api/actual-workouts/monthly-calories', () => {
  it('should get monthly calorie burn data', async () => {
    // Create actual workout with calories
    await global.prisma.actualWorkout.create({
      data: {
        userId: global.testUsers.user.id,
        title: 'Calorie Burn Workout',
        completedDate: new Date(),
        actualDuration: 45,
        actualExercises: {
          create: [
            {
              exerciseId: global.testExercises.pushup.id,
              actualSets: 3,
              actualReps: 10,
              actualCalories: 150
            },
            {
              exerciseId: global.testExercises.running.id,
              actualDuration: 30,
              actualCalories: 200
            }
          ]
        }
      }
    });

    const response = await request(app)
      .get('/api/actual-workouts/monthly-calories')
      .set('Authorization', getAuthHeader(global.testUsers.user))
      .query({ months: 6 })
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data).toHaveLength(6);
    
    response.body.data.forEach(monthData => {
      expect(monthData).toHaveProperty('month');
      expect(monthData).toHaveProperty('totalCalories');
      expect(typeof monthData.totalCalories).toBe('number');
    });
  });

  it('should validate months parameter', async () => {
    const response = await request(app)
      .get('/api/actual-workouts/monthly-calories')
      .set('Authorization', getAuthHeader(global.testUsers.user))
      .query({ months: 100 })
      .expect(400);

    expect(response.body.status).toBe('error');
  });

  it('should default to 12 months when no parameter provided', async () => {
    const response = await request(app)
      .get('/api/actual-workouts/monthly-calories')
      .set('Authorization', getAuthHeader(global.testUsers.user))
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveLength(12);
  });
});

// Enhance the existing from-planned test section
describe('POST /api/actual-workouts/from-planned/:plannedId - Enhanced', () => {
  it('should create actual workout from planned with custom exercises', async () => {
    // Create a planned workout
    const plannedWorkout = await global.prisma.plannedWorkout.create({
      data: {
        userId: global.testUsers.user.id,
        title: 'Custom Planned Workout',
        scheduledDate: new Date(),
        estimatedDuration: 45,
        plannedExercises: {
          create: [
            {
              exerciseId: global.testExercises.pushup.id,
              plannedSets: 3,
              plannedReps: 10,
              plannedCalories: 100
            }
          ]
        }
      },
      include: { plannedExercises: true }
    });

    const workoutData = {
      completedDate: new Date().toISOString(),
      completedTime: '14:30',
      actualDuration: 40,
      exercises: [
        {
          exerciseId: global.testExercises.pushup.id,
          plannedExerciseId: plannedWorkout.plannedExercises[0].id,
          actualSets: 4,
          actualReps: 12,
          actualCalories: 120
        }
      ]
    };

    const response = await request(app)
      .post(`/api/actual-workouts/from-planned/${plannedWorkout.id}`)
      .set('Authorization', getAuthHeader(global.testUsers.user))
      .send(workoutData)
      .expect(201);

    expect(response.body.status).toBe('success');
    expect(response.body.data.plannedId).toBe(plannedWorkout.id);
    expect(response.body.data.actualExercises[0].actualSets).toBe(4);
  });

  it('should prevent duplicate completion of planned workout', async () => {
    const plannedWorkout = await global.prisma.plannedWorkout.create({
      data: {
        userId: global.testUsers.user.id,
        title: 'Already Completed Workout',
        scheduledDate: new Date(),
        estimatedDuration: 30
      }
    });

    // Create first completion
    await request(app)
      .post(`/api/actual-workouts/from-planned/${plannedWorkout.id}`)
      .set('Authorization', getAuthHeader(global.testUsers.user))
      .send({
        completedDate: new Date().toISOString(),
        actualDuration: 25
      })
      .expect(201);

    // Try to complete again
    const response = await request(app)
      .post(`/api/actual-workouts/from-planned/${plannedWorkout.id}`)
      .set('Authorization', getAuthHeader(global.testUsers.user))
      .send({
        completedDate: new Date().toISOString(),
        actualDuration: 30
      })
      .expect(400);

    expect(response.body.status).toBe('error');
    expect(response.body.message).toBe('This planned workout has already been logged');
  });
});