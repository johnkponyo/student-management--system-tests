const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const courseController = require('../../controllers/courseController');
const Course = require('../../models/courseModel');
const { initRedis } = require('../../services/redisService');
const { server } = require('../../app')

// Test app
const app = express();
app.use(bodyParser.json());
app.use('/api/courses', require('../../routes/courseRoutes'));

// Mocks
jest.mock('../../models/courseModel');
jest.mock('../../services/redisService');
jest.mock('../../middlewares/authMiddleware', () => ({
  authenticateAll: (req, res, next) => next(),
  authenticateInstructors: (req, res, next) => next()
}));

describe('Course Controller Integration Tests', () => {
  const mockCourse = {
    courseCode: 'CS101',
    courseName: 'Introduction to Programming',
    courseDescription: 'A beginner-friendly programming course',
    credits: 3,
    semester: 'Fall',
    department: 'Computer Science'
  };

  const mockRedisClient = {
    get: jest.fn(),
    set: jest.fn()
  };

  beforeAll(() => {
    initRedis.mockResolvedValue(mockRedisClient);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  afterAll(() => {
    //server.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/courses', () => {
    it('should return cached courses if available', async () => {
      const cachedCourses = [mockCourse];
      mockRedisClient.get.mockResolvedValue(JSON.stringify(cachedCourses));

      const response = await request(app)
        .get('/api/courses')
        .expect(200);

      expect(mockRedisClient.get).toHaveBeenCalled();
      expect(Course.find).not.toHaveBeenCalled();
      expect(response.body).toEqual(cachedCourses);
    });

    it('should fetch and cache courses if not in cache', async () => {
      mockRedisClient.get.mockResolvedValue(null);
      Course.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([mockCourse])
        })
      });
      Course.countDocuments.mockResolvedValue(1);

      const response = await request(app)
        .get('/api/courses')
        .expect(200);

      expect(mockRedisClient.get).toHaveBeenCalled();
      expect(Course.find).toHaveBeenCalled();
      expect(mockRedisClient.set).toHaveBeenCalled();
      expect(response.body).toHaveProperty('courses');
      expect(response.body).toHaveProperty('pagination');
    });

    it('should handle filtering by department and semester', async () => {
      mockRedisClient.get.mockResolvedValue(null);
      Course.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([mockCourse])
        })
      });
      Course.countDocuments.mockResolvedValue(1);

      const response = await request(app)
        .get('/api/courses?department=Computer Science&semester=Fall')
        .expect(200);

      expect(Course.find).toHaveBeenCalledWith({
        department: 'Computer Science',
        semester: 'Fall'
      });
    });
  });

  describe('GET /api/courses/:courseCode', () => {
    it('should return a course if found', async () => {
      Course.findOne.mockResolvedValue(mockCourse);

      const response = await request(app)
        .get('/api/courses/CS101')
        .expect(200);

      expect(Course.findOne).toHaveBeenCalledWith({ courseCode: 'CS101' });
      expect(response.body).toEqual(mockCourse);
    });

    it('should return 404 if course not found', async () => {
      Course.findOne.mockResolvedValue(null);

      await request(app)
        .get('/api/courses/NOTFOUND')
        .expect(404);
    });
  });

  describe('POST /api/courses', () => {
    it('should create a new course successfully', async () => {
      // Mock the course existence check
      Course.findOne.mockResolvedValue(null);
      
      // Mock the Course constructor and save method
      const mockSavedCourse = { ...mockCourse };
      Course.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockSavedCourse)
      }));

      const response = await request(app)
        .post('/api/courses')
        .send(mockCourse)
        .expect(201);

      expect(Course.findOne).toHaveBeenCalledWith({ courseCode: mockCourse.courseCode });
      //expect(response.body).toEqual(mockSavedCourse);
    });

    it('should return 409 if course already exists', async () => {
      Course.findOne.mockResolvedValue(mockCourse);

      await request(app)
        .post('/api/courses')
        .send(mockCourse)
        .expect(409);
    });
  });

  describe('PUT /api/courses/:courseCode', () => {
    it('should update a course successfully', async () => {
      const updatedCourse = { ...mockCourse, courseName: 'Updated Course' };
      Course.findOneAndUpdate.mockResolvedValue(updatedCourse);

      const response = await request(app)
        .put('/api/courses/CS101')
        .send(updatedCourse)
        .expect(200);

      expect(Course.findOneAndUpdate).toHaveBeenCalledWith(
        { courseCode: 'CS101' },
        updatedCourse,
        { new: true }
      );
      expect(response.body).toEqual(updatedCourse);
    });

    it('should return 404 if course not found for update', async () => {
      Course.findOneAndUpdate.mockResolvedValue(null);

      await request(app)
        .put('/api/courses/NOTFOUND')
        .send(mockCourse)
        .expect(404);
    });
  });

  describe('DELETE /api/courses/:courseCode', () => {
    it('should delete a course successfully', async () => {
      Course.findOneAndDelete.mockResolvedValue(mockCourse);

      await request(app)
        .delete('/api/courses/CS101')
        .expect(200);

      expect(Course.findOneAndDelete).toHaveBeenCalledWith({ courseCode: 'CS101' });
    });

    it('should return 404 if course not found for deletion', async () => {
      Course.findOneAndDelete.mockResolvedValue(null);

      await request(app)
        .delete('/api/courses/NOTFOUND')
        .expect(404);
    });
  });
});