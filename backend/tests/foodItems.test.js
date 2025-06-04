//tests/foodItems.test.js
const request = require('supertest');
const app = require('../src/app');
const { getAuthHeader } = require('./utils/auth');

describe('Food Items Routes', () => {
  describe('GET /api/food-items', () => {
    it('should get all food items without authentication', async () => {
      // Create test food items
      await global.prisma.foodItem.createMany({
        data: [
          {
            name: 'Test Apple',
            caloriesPerUnit: 95,
            servingUnit: 'medium',
            description: 'A test apple'
          },
          {
            name: 'Test Banana',
            caloriesPerUnit: 105,
            servingUnit: 'medium',
            description: 'A test banana'
          }
        ]
      });

      const response = await request(app)
        .get('/api/food-items')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
    });

    it('should search food items by name', async () => {
      const response = await request(app)
        .get('/api/food-items?search=apple')
        .expect(200);

      expect(response.body.status).toBe('success');
    });

    it('should paginate food items', async () => {
      const response = await request(app)
        .get('/api/food-items?page=1&limit=5')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });
  });

  describe('GET /api/food-items/all', () => {
    it('should get all food items without pagination', async () => {
      const response = await request(app)
        .get('/api/food-items/all')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeUndefined();
    });
  });

  describe('GET /api/food-items/:id', () => {
    it('should get food item by id', async () => {
      const foodItem = await global.prisma.foodItem.create({
        data: {
          name: 'Test Food Item',
          caloriesPerUnit: 100,
          servingUnit: '100g',
          description: 'A test food item'
        }
      });

      const response = await request(app)
        .get(`/api/food-items/${foodItem.id}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.id).toBe(foodItem.id);
      expect(response.body.data.name).toBe('Test Food Item');
    });

    it('should return 404 for non-existent food item', async () => {
      const response = await request(app)
        .get('/api/food-items/999999')
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Food item not found');
    });
  });

  describe('POST /api/food-items', () => {
    it('should create food item as admin', async () => {
      const foodData = {
        name: 'New Test Food',
        caloriesPerUnit: 150,
        servingUnit: '100g',
        description: 'A new test food item'
      };

      const response = await request(app)
        .post('/api/food-items')
        .set('Authorization', getAuthHeader(global.testUsers.admin))
        .send(foodData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Food item created successfully');
      expect(response.body.data.name).toBe(foodData.name);
    });

    it('should return 403 for non-admin user', async () => {
      const foodData = {
        name: 'Unauthorized Food',
        caloriesPerUnit: 150,
        servingUnit: '100g'
      };

      const response = await request(app)
        .post('/api/food-items')
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send(foodData)
        .expect(403);

      expect(response.body.status).toBe('error');
    });

    it('should return 409 for duplicate food name', async () => {
      // Create a food item first
      await global.prisma.foodItem.create({
        data: {
          name: 'Duplicate Food',
          caloriesPerUnit: 100,
          servingUnit: '100g'
        }
      });

      const foodData = {
        name: 'Duplicate Food',
        caloriesPerUnit: 150,
        servingUnit: '100g'
      };

      const response = await request(app)
        .post('/api/food-items')
        .set('Authorization', getAuthHeader(global.testUsers.admin))
        .send(foodData)
        .expect(409);

      expect(response.body.status).toBe('error');
    });
  });

  describe('PUT /api/food-items/:id', () => {
    it('should update food item as admin', async () => {
      const foodItem = await global.prisma.foodItem.create({
        data: {
          name: 'Food to Update',
          caloriesPerUnit: 100,
          servingUnit: '100g'
        }
      });

      const updateData = {
        description: 'Updated description',
        caloriesPerUnit: 120
      };

      const response = await request(app)
        .put(`/api/food-items/${foodItem.id}`)
        .set('Authorization', getAuthHeader(global.testUsers.admin))
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Food item updated successfully');
      expect(response.body.data.description).toBe(updateData.description);
    });

    it('should return 403 for non-admin user', async () => {
      const foodItem = await global.prisma.foodItem.create({
        data: {
          name: 'Protected Food',
          caloriesPerUnit: 100,
          servingUnit: '100g'
        }
      });

      const updateData = {
        description: 'Unauthorized update'
      };

      const response = await request(app)
        .put(`/api/food-items/${foodItem.id}`)
        .set('Authorization', getAuthHeader(global.testUsers.user))
        .send(updateData)
        .expect(403);

      expect(response.body.status).toBe('error');
    });
  });

  describe('DELETE /api/food-items/:id', () => {
    it('should delete food item as admin', async () => {
      const foodItem = await global.prisma.foodItem.create({
        data: {
          name: 'Food to Delete',
          caloriesPerUnit: 100,
          servingUnit: '100g'
        }
      });

      const response = await request(app)
        .delete(`/api/food-items/${foodItem.id}`)
        .set('Authorization', getAuthHeader(global.testUsers.admin))
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Food item deleted successfully');

      // Verify deletion
      const deletedFood = await global.prisma.foodItem.findUnique({
        where: { id: foodItem.id }
      });
      expect(deletedFood).toBeNull();
    });

    it('should return 400 if food item is used in diet entries', async () => {
      const foodItem = await global.prisma.foodItem.create({
        data: {
          name: 'Used Food Item',
          caloriesPerUnit: 100,
          servingUnit: '100g'
        }
      });

      // Create diet entry using this food item
      await global.prisma.dietEntry.create({
        data: {
          userId: global.testUsers.user.id,
          foodId: foodItem.id,
          quantity: 1,
          calories: 100,
          consumptionDate: new Date()
        }
      });

      const response = await request(app)
        .delete(`/api/food-items/${foodItem.id}`)
        .set('Authorization', getAuthHeader(global.testUsers.admin))
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('is used in');
    });
  });
});

