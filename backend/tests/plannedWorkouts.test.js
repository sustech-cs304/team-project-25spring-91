//tests/plannedWorkouts.test.js
const request = require('supertest');
const app = require('../src/app');
const { getAuthHeader } = require('./utils/auth');

describe('Planned Workouts Routes', () => {
  describe('GET /api/planned-workouts', () => {
    it('should get user planned workouts', async () => {
      // Create a planned workout first
      await global.prisma.plannedWorkout.create({
        data: {
          userId: global.testUsers.user.id,
          title: 'Test Workout',
          scheduledDate: new Date(),
          estimatedDuration: 60,
          plannedExercises: {
            create: [
              {
                exerciseId: global.testExercises.pushup.id,
                plannedSets: 3,
                plannedReps: 10,
                plannedWeight: 10
              }
            ]
          }
        }
      });

      const response = await request(app)
        .get('/api/planned-workouts')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.results).toBe(response.body.data.length);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/planned-workouts')
        .expect(401);

      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/planned-workouts', () => {
    it('should create planned workout', async () => {
      const workoutData = {
        title: 'Morning Workout',
        scheduledDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        estimatedDuration: 45,
        exercises: [
          {
            exerciseId: global.testExercises.pushup.id,
            plannedSets: 3,
            plannedReps: 12,
            plannedWeight: 10
          },
          {
            exerciseId: global.testExercises.squat.id,
            plannedSets: 3,
            plannedReps: 15
          }
        ]
      };

      const response = await request(app)
        .post('/api/planned-workouts')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send(workoutData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Workout scheduled successfully');
      expect(response.body.data.title).toBe(workoutData.title);
      expect(response.body.data.plannedExercises).toHaveLength(2);
    });

    it('should return 400 for invalid exercise id', async () => {
      const workoutData = {
        title: 'Invalid Workout',
        scheduledDate: new Date(Date.now() + 86400000).toISOString(),
        estimatedDuration: 45,
        exercises: [
          {
            exerciseId: 999999, // Non-existent exercise
            plannedSets: 3,
            plannedReps: 12
          }
        ]
      };

      const response = await request(app)
        .post('/api/planned-workouts')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send(workoutData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Some exercises do not exist');
    });

    it('should return 400 for empty exercises array', async () => {
      const workoutData = {
        title: 'Empty Workout',
        scheduledDate: new Date(Date.now() + 86400000).toISOString(),
        estimatedDuration: 45,
        exercises: []
      };

      const response = await request(app)
        .post('/api/planned-workouts')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send(workoutData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Validation error');
    });
  });

  describe('GET /api/planned-workouts/upcoming', () => {
    it('should get upcoming workouts', async () => {
      // Create an upcoming workout
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      await global.prisma.plannedWorkout.create({
        data: {
          userId: global.testUsers.user.id,
          title: 'Upcoming Workout',
          scheduledDate: tomorrow,
          estimatedDuration: 30
        }
      });

      const response = await request(app)
        .get('/api/planned-workouts/upcoming')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should filter by days parameter', async () => {
      const response = await request(app)
        .get('/api/planned-workouts/upcoming?days=3')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(200);

      expect(response.body.status).toBe('success');
    });
  });

  describe('GET /api/planned-workouts/:id', () => {
    it('should get planned workout by id', async () => {
      const workout = await global.prisma.plannedWorkout.create({
        data: {
          userId: global.testUsers.user.id,
          title: 'Test Workout Detail',
          scheduledDate: new Date(),
          estimatedDuration: 60
        }
      });

      const response = await request(app)
        .get(`/api/planned-workouts/${workout.id}`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.id).toBe(workout.id);
      expect(response.body.data.title).toBe('Test Workout Detail');
    });

    it('should return 404 for non-existent workout', async () => {
      const response = await request(app)
        .get('/api/planned-workouts/999999')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Workout not found');
    });

    it('should return 404 for workout belonging to another user', async () => {
      // Create workout for admin user
      const workout = await global.prisma.plannedWorkout.create({
        data: {
          userId: global.testUsers.admin.id,
          title: 'Admin Workout',
          scheduledDate: new Date(),
          estimatedDuration: 60
        }
      });

      // Try to access as regular user
      const response = await request(app)
        .get(`/api/planned-workouts/${workout.id}`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Workout not found');
    });
  });
});

// Add these test cases to the existing file

describe('PUT /api/planned-workouts/:id', () => {
  it('should update planned workout', async () => {
    const workout = await global.prisma.plannedWorkout.create({
      data: {
        userId: global.testUsers.user.id,
        title: 'Workout to Update',
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        estimatedDuration: 30
      }
    });

    const updateData = {
      title: 'Updated Planned Workout',
      estimatedDuration: 45
    };

    const response = await request(app)
      .put(`/api/planned-workouts/${workout.id}`)
      .set('Authorization', getAuthHeader(global.testUsers.user))
      .send(updateData)
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data.title).toBe(updateData.title);
  });

  it('should return 400 for updating completed workout', async () => {
    const plannedWorkout = await global.prisma.plannedWorkout.create({
      data: {
        userId: global.testUsers.user.id,
        title: 'Completed Planned',
        scheduledDate: new Date(),
        estimatedDuration: 30
      }
    });

    // Create actual workout linked to planned
    await global.prisma.actualWorkout.create({
      data: {
        userId: global.testUsers.user.id,
        plannedId: plannedWorkout.id,
        title: 'Completed',
        completedDate: new Date(),
        actualDuration: 30
      }
    });

    const updateData = {
      title: 'Should not update'
    };

    const response = await request(app)
      .put(`/api/planned-workouts/${plannedWorkout.id}`)
      .set('Authorization', getAuthHeader(global.testUsers.user))
      .send(updateData)
      .expect(400);

    expect(response.body.status).toBe('error');
  });
});



  it('should return 400 for deleting completed workout', async () => {
    const plannedWorkout = await global.prisma.plannedWorkout.create({
      data: {
        userId: global.testUsers.user.id,
        title: 'Completed Planned',
        scheduledDate: new Date(),
        estimatedDuration: 30
      }
    });

    // Create actual workout linked to planned
    await global.prisma.actualWorkout.create({
      data: {
        userId: global.testUsers.user.id,
        plannedId: plannedWorkout.id,
        title: 'Completed',
        completedDate: new Date(),
        actualDuration: 30
      }
    });

    const response = await request(app)
      .delete(`/api/planned-workouts/${plannedWorkout.id}`)
      .set('Authorization', getAuthHeader(global.testUsers.user))
      .expect(400);

    expect(response.body.status).toBe('error');
  });
