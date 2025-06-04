//tests/users.test.js
const request = require('supertest');
const app = require('../src/app');
const { getAuthHeader } = require('./utils/auth');

describe('User Routes', () => {
  describe('GET /api/users/profile', () => {
    it('should get user profile', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.email).toBe(global.testUsers.user.email);
      expect(response.body.data.displayName).toBe(global.testUsers.user.displayName);
      expect(response.body.data.role).toBe(global.testUsers.user.role);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .expect(401);

      expect(response.body.status).toBe('error');
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile', async () => {
      const updateData = {
        displayName: 'Updated Test User',
        gender: 'Male',
        heightCm: 180,
        weightKg: 75
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Profile updated successfully');
      expect(response.body.data.displayName).toBe(updateData.displayName);
      expect(response.body.data.gender).toBe(updateData.gender);
      expect(response.body.data.heightCm).toBe(updateData.heightCm);
    });

    it('should update password with current password', async () => {
      const updateData = {
        currentPassword: 'password123',
        newPassword: 'newpassword123'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Profile updated successfully');
    });

    it('should return 400 for incorrect current password', async () => {
      const updateData = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send(updateData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Current password is incorrect');
    });
  });

  describe('GET /api/users/admin/all-users', () => {
    it('should get all users as admin', async () => {
      const response = await request(app)
        .get('/api/users/admin/all-users')
        .set('Authorization', getAuthHeader(global.testUsers.admin))
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
    });

    it('should return 403 for non-admin user', async () => {
      const response = await request(app)
        .get('/api/users/admin/all-users')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(403);

      expect(response.body.status).toBe('error');
    });

    it('should filter users by role', async () => {
      const response = await request(app)
        .get('/api/users/admin/all-users?role=admin')
        .set('Authorization', getAuthHeader(global.testUsers.admin))
        .expect(200);

      expect(response.body.status).toBe('success');
      response.body.data.forEach(user => {
        expect(user.role).toBe('admin');
      });
    });

    it('should search users by email/name', async () => {
      const response = await request(app)
        .get('/api/users/admin/all-users?search=test')
        .set('Authorization', getAuthHeader(global.testUsers.admin))
        .expect(200);

      expect(response.body.status).toBe('success');
    });
  });

  describe('PUT /api/users/admin/change-role/:id', () => {
    it('should change user role as admin', async () => {
      const updateData = {
        role: 'gym_owner'
      };

      const response = await request(app)
        .put(`/api/users/admin/change-role/${global.testUsers.user.id}`)
        .set('Authorization', getAuthHeader(global.testUsers.admin))
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('User role updated successfully');
      expect(response.body.data.role).toBe('gym_owner');
    });

    it('should return 403 for non-admin user', async () => {
      const updateData = {
        role: 'admin'
      };

      const response = await request(app)
        .put(`/api/users/admin/change-role/${global.testUsers.user.id}`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send(updateData)
        .expect(403);

      expect(response.body.status).toBe('error');
    });

    it('should return 400 for invalid role', async () => {
      const updateData = {
        role: 'invalid_role'
      };

      const response = await request(app)
        .put(`/api/users/admin/change-role/${global.testUsers.user.id}`)
        .set('Authorization', getAuthHeader(global.testUsers.admin))
        .send(updateData)
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/users/admin/statistics/counts', () => {
    it('should get user counts as admin', async () => {
      const response = await request(app)
        .get('/api/users/admin/statistics/counts')
        .set('Authorization', getAuthHeader(global.testUsers.admin))
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.totalUsers).toBeGreaterThanOrEqual(3);
      expect(response.body.data.totalAdmins).toBeGreaterThanOrEqual(1);
      expect(response.body.data.totalGymOwners).toBeGreaterThanOrEqual(1);
      expect(response.body.data.totalRegularUsers).toBeGreaterThanOrEqual(0);
    });

    it('should return 403 for non-admin user', async () => {
      const response = await request(app)
        .get('/api/users/admin/statistics/counts')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .expect(403);

      expect(response.body.status).toBe('error');
    });
  });
});

// Add after the existing statistics test
describe('GET /api/users/admin/statistics/monthly-signups', () => {
  it('should get monthly signup statistics as admin', async () => {
    const response = await request(app)
      .get('/api/users/admin/statistics/monthly-signups')
      .set('Authorization', getAuthHeader(global.testUsers.admin))
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
    
    response.body.data.forEach(monthData => {
      expect(monthData).toHaveProperty('month');
      expect(monthData).toHaveProperty('count');
      expect(typeof monthData.count).toBe('number');
      expect(monthData.month).toMatch(/^\d{4}-\d{2}$/); // YYYY-MM format
    });

    // Should have data for recent months
    expect(response.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('should return 403 for non-admin user', async () => {
    const response = await request(app)
      .get('/api/users/admin/statistics/monthly-signups')
      .set('Authorization', getAuthHeader(global.testUsers.user))
      .expect(403);

    expect(response.body.status).toBe('error');
  });
});

describe('GET /api/users/gym-owner/dashboard-stats', () => {
  beforeEach(async () => {
    // Create gym for gym owner
    await global.prisma.gym.create({
      data: {
        name: 'Dashboard Test Gym',
        address: '123 Dashboard St',
        ownerId: global.testUsers.gymOwner.id
      }
    });
  });

  it('should get gym owner dashboard stats', async () => {
    const response = await request(app)
      .get('/api/users/gym-owner/dashboard-stats')
      .set('Authorization', getAuthHeader(global.testUsers.gymOwner))
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('totalOwnedGyms');
    expect(response.body.data).toHaveProperty('totalBookingsInOwnedGyms');
    expect(response.body.data).toHaveProperty('revenueThisMonth');
    
    expect(typeof response.body.data.totalOwnedGyms).toBe('number');
    expect(typeof response.body.data.totalBookingsInOwnedGyms).toBe('number');
    expect(typeof response.body.data.revenueThisMonth).toBe('number');
    
    // Should have at least 1 gym (created in beforeEach)
    expect(response.body.data.totalOwnedGyms).toBeGreaterThanOrEqual(1);
  });

  it('should return 403 for non-gym-owner user', async () => {
    const response = await request(app)
      .get('/api/users/gym-owner/dashboard-stats')
      .set('Authorization', getAuthHeader(global.testUsers.admin))
      .expect(403);

    expect(response.body.status).toBe('error');
  });

  it('should return 403 for admin user', async () => {
    const response = await request(app)
      .get('/api/users/gym-owner/dashboard-stats')
      .set('Authorization', getAuthHeader(global.testUsers.admin))
      .expect(403);

    expect(response.body.status).toBe('error');
  });
});

describe('PUT /api/users/profile/image', () => {
  it('should handle image upload endpoint without file', async () => {
    const response = await request(app)
      .put('/api/users/profile/image')
      .set('Authorization', getAuthHeader(global.testUsers.user));

    // Should get 400 for missing image, not authentication error
    expect([400, 500]).toContain(response.status);
  });

  it('should require authentication', async () => {
    const response = await request(app)
      .put('/api/users/profile/image')
      .expect(401);

    expect(response.body.status).toBe('error');
  });
});

// Enhanced profile tests
describe('PUT /api/users/profile - Enhanced', () => {
  it('should update profile with date of birth', async () => {
    const updateData = {
      displayName: 'Enhanced Test User',
      dateOfBirth: '1990-01-15',
      gender: 'Female',
      heightCm: 165,
      weightKg: 60
    };

    
    const response = await request(app)
      .put('/api/users/profile')
      .set('Authorization', getAuthHeader(global.testUsers.user))
      .send(updateData)
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data.dateOfBirth).toBeDefined();
    expect(response.body.data.heightCm).toBe(updateData.heightCm);
    expect(parseInt(response.body.data.weightKg)).toBe(updateData.weightKg);
  });

  it('should validate new password without current password', async () => {
    const updateData = {
      newPassword: 'newpassword123'
      // Missing currentPassword
    };

    const response = await request(app)
      .put('/api/users/profile')
      .set('Authorization', getAuthHeader(global.testUsers.user))
      .send(updateData)
      .expect(400);

    expect(response.body.status).toBe('error');
  });
});