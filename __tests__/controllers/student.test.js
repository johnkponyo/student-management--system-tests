
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { app, server } = require('../../app');
const Student = require('../../models/studentModel');
const Counter = require('../../models/idCounterModel');
const { initRedis } = require('../../services/redisService');

// Mocks
jest.mock('jsonwebtoken');
jest.mock('bcrypt');
jest.mock('../../models/studentModel');
jest.mock('../../models/idCounterModel');
jest.mock('../../services/redisService', () => ({
  initRedis: jest.fn().mockResolvedValue({
    get: jest.fn(),
    set: jest.fn()
  })
}));


describe('Student Controller Integration Tests', () => {
  let mockRedisClient;

  const mockStudent = {
    _id: 'mockid123',
    studentId: 'ETUD000001',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1995-01-01',
    gender: 'Male',
    email: 'john@example.com',
    phoneNumber: '+1234567890',
    address: '123 Main St',
    status: 'Active',
    password: 'hashedpassword123'
  };

  beforeAll(async () => {
    mockRedisClient = await initRedis();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockRedisClient.get.mockReset();
    mockRedisClient.set.mockReset();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    // server.close();
  });

  describe('POST /api/students/login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'password123'
      };

      Student.findOne.mockResolvedValue(mockStudent);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mockedtoken123');

      const response = await request(app)
        .post('/api/students/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.message).toBe('Login successful');
    });

    it('should fail with invalid email', async () => {
      Student.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/students/login')
        .send({
          email: 'wrong@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid email or password');
    });
  });

  describe('GET /api/students', () => {
    const mockToken = 'mocktoken123';
    const mockInstructorPayload = { id: 'instructor123', role: 'instructor' };

    beforeEach(() => {
      jwt.verify.mockReturnValue(mockInstructorPayload);
    });

    it('should return all students with pagination', async () => {
      const mockStudents = [mockStudent];
      mockRedisClient.get.mockResolvedValue(null); // Cache miss
      
      Student.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockStudents)
        })
      });
      Student.countDocuments.mockResolvedValue(1);

      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('students');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.students).toEqual(mockStudents);
    });

    it('should return cached data when available', async () => {
      const cachedStudents = [mockStudent];
      mockRedisClient.get.mockResolvedValue(JSON.stringify(cachedStudents));

      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(JSON.parse(response.text)).toEqual(cachedStudents);
    });

    it('should return 204 when no students found', async () => {
      mockRedisClient.get.mockResolvedValue(null); // Cache miss
      
      Student.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([])
        })
      });
      Student.countDocuments.mockResolvedValue(0);

      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(204);
    });
  });

  describe('GET /api/students/:id', () => {
    it('should return student details for self access', async () => {
      const mockToken = 'mocktoken123';
      jwt.verify.mockReturnValue({ id: 'mockid123', role: 'student' });
      Student.findById.mockResolvedValue(mockStudent);

      const response = await request(app)
        .get('/api/students/mockid123')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockStudent);
    });

    it('should deny access to other student details', async () => {
      const mockToken = 'mocktoken123';
      jwt.verify.mockReturnValue({ id: 'differentid', role: 'student' });

      const response = await request(app)
        .get('/api/students/mockid123')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Only self access allowed!');
    });
  });

  describe('POST /api/students', () => {
    it('should create a new student successfully', async () => {
      const mockToken = 'mocktoken123';
      jwt.verify.mockReturnValue({ id: 'instructor123', role: 'instructor' });
      
      Counter.findOneAndUpdate.mockResolvedValue({ currentValue: 1 });
      Student.prototype.save.mockResolvedValue(mockStudent);

      const newStudentData = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1995-01-01',
        gender: 'Male',
        email: 'john@example.com',
        phoneNumber: '0329876543',
        address: '123 Main St',
        status: 'Active'
      };

      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(newStudentData);

        console.log('REQUEST BODY IS: ', response.body)

      expect(response.status).toBe(201);
    
    });

    it('should validate required fields', async () => {
      const mockToken = 'mocktoken123';
      jwt.verify.mockReturnValue({ id: 'instructor123', role: 'instructor' });

      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/students/:id', () => {
    it('should update student details successfully', async () => {
      const mockToken = 'mocktoken123';
      jwt.verify.mockReturnValue({ id: 'mockid123', role: 'student' });
      
      const updatedStudent = { ...mockStudent, firstName: 'Jane' };
      Student.findByIdAndUpdate.mockResolvedValue(updatedStudent);

      const response = await request(app)
        .put('/api/students/mockid123')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ firstName: 'Jane' });

      expect(response.status).toBe(200);
      expect(response.body.firstName).toBe('Jane');
    });

    it('should return 404 for non-existent student', async () => {
      const mockToken = 'mocktoken123';
      jwt.verify.mockReturnValue({ id: 'instructor123', role: 'instructor' });
      Student.findByIdAndUpdate.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/students/nonexistentid')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ firstName: 'Jane' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/students/:id', () => {
    it('should delete student successfully', async () => {
      const mockToken = 'mocktoken123';
      jwt.verify.mockReturnValue({ id: 'instructor123', role: 'instructor' });
      Student.findByIdAndDelete.mockResolvedValue(mockStudent);

      const response = await request(app)
        .delete('/api/students/mockid123')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Student deleted successfully');
    });

    it('should return 404 for non-existent student', async () => {
      const mockToken = 'mocktoken123';
      jwt.verify.mockReturnValue({ id: 'instructor123', role: 'instructor' });
      Student.findByIdAndDelete.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/students/nonexistentid')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(404);
    });
  });
});