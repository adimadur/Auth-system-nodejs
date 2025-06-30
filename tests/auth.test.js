import request from 'supertest';
import app from '../index.js';
import { UserModel } from '../models/userModel.js';
import mongoose from 'mongoose';

describe('Authentication Endpoints', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGOURL || 'mongodb://localhost:27017/auth-system-test');
  });

  afterAll(async () => {
    // Clean up and disconnect
    await UserModel.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear database before each test
    await UserModel.deleteMany({});
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'SecurePass123!',
        age: 25
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User created successfully');
      expect(response.body.data.username).toBe(userData.username);
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.token).toBeDefined();
      expect(response.body.data.password).toBeUndefined();
    });

    it('should return error for duplicate username', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'SecurePass123!'
      };

      // Create first user
      await request(app)
        .post('/api/auth/signup')
        .send(userData);

      // Try to create second user with same username
      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('username already exists');
    });

    it('should return error for invalid password', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'weak'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Password must be at least 8 characters long');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'SecurePass123!'
      };

      await request(app)
        .post('/api/auth/signup')
        .send(userData);
    });

    it('should login successfully with correct credentials', async () => {
      const loginData = {
        username: 'testuser',
        password: 'SecurePass123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data.username).toBe(loginData.username);
      expect(response.body.token).toBeDefined();
    });

    it('should return error for incorrect password', async () => {
      const loginData = {
        username: 'testuser',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Invalid credentials');
    });

    it('should return error for non-existent user', async () => {
      const loginData = {
        username: 'nonexistent',
        password: 'SecurePass123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Invalid credentials');
    });
  });

  describe('GET /health', () => {
    it('should return health check status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Server is running');
      expect(response.body.environment).toBeDefined();
    });
  });
}); 