const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../../app');
const Enrollment = require('../../models/enrollmentModel');
const Student = require('../../models/studentModel');
const Course = require('../../models/courseModel');
const Instructor = require('../../models/instructorModel');
const { initRedis } = require('../../services/redisService');

// Mocks
jest.mock('../../services/redisService', () => ({
  initRedis: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn()
  }))
}));

jest.mock('../../models/enrollmentModel');
jest.mock('../../models/studentModel');
jest.mock('../../models/courseModel');
jest.mock('../../models/instructorModel');

jest.mock('../../middlewares/authMiddleware', () => ({
  authenticateAll: (req, res, next) => next(),
  authenticateInstructors: (req, res, next) => next()
}));

describe('Enrollment Controller Integration Tests', () => {
  const mockStudentId = new mongoose.Types.ObjectId();
  const mockCourseId = new mongoose.Types.ObjectId();
  const mockInstructorId = new mongoose.Types.ObjectId();
  const mockEnrollmentId = new mongoose.Types.ObjectId();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/enrollments', () => {
    const validEnrollmentData = {
      studentId: mockStudentId.toString(),
      courseId: mockCourseId.toString(),
      instructorId: mockInstructorId.toString()
    };

    it('should successfully enroll a student in a course', async () => {

      Student.findById.mockResolvedValue({ _id: mockStudentId });
      Course.findById.mockResolvedValue({ _id: mockCourseId });
      Instructor.findById.mockResolvedValue({ _id: mockInstructorId });
      
      const mockSavedEnrollment = {
        _id: mockEnrollmentId,
        student: mockStudentId,
        course: mockCourseId,
        instructor: mockInstructorId,
        status: 'Active',
        toJSON: function() {
          return this;
        }
      };

      Enrollment.prototype.save = jest.fn().mockResolvedValue(mockSavedEnrollment);

      const response = await request(app)
        .post('/api/enrollments')
        .send(validEnrollmentData)
        .expect(201);

    //   expect(response.body).toHaveProperty('_id');
    //   expect(response.body.status).toBe('Active');
    });

    it('should return 404 when student is not found', async () => {
      Student.findById.mockResolvedValue(null);

      await request(app)
        .post('/api/enrollments')
        .send(validEnrollmentData)
        .expect(404);
    });

    it('should return 400 for invalid MongoDB ObjectId', async () => {
      await request(app)
        .post('/api/enrollments')
        .send({
          studentId: 'invalid-id',
          courseId: mockCourseId.toString(),
          instructorId: mockInstructorId.toString()
        })
        .expect(400);
    });
  });

  describe('GET /api/enrollments/student/:studentId', () => {
    it('should return enrolled courses for a student', async () => {
      const mockEnrollments = [
        {
          _id: mockEnrollmentId,
          student: mockStudentId,
          course: { _id: mockCourseId, name: 'Test Course' },
          instructor: { _id: mockInstructorId, name: 'Test Instructor' }
        }
      ];

      const populateMock = jest.fn().mockResolvedValue(mockEnrollments);
      const firstPopulateMock = jest.fn().mockReturnValue({ populate: populateMock });
      
      Enrollment.find.mockReturnValue({
        populate: firstPopulateMock
      });

      const response = await request(app)
        .get(`/api/enrollments/student/${mockStudentId}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].course.name).toBe('Test Course');
    });

    it('should return 404 when no enrollments found', async () => {
      const populateMock = jest.fn().mockResolvedValue([]);
      const firstPopulateMock = jest.fn().mockReturnValue({ populate: populateMock });
      
      Enrollment.find.mockReturnValue({
        populate: firstPopulateMock
      });

      await request(app)
        .get(`/api/enrollments/student/${mockStudentId}`)
        .expect(404);
    });
  });

  describe('GET /api/enrollments/course/:courseId', () => {
    it('should return enrolled students for a course with pagination', async () => {
      const mockEnrollments = [
        {
          _id: mockEnrollmentId,
          student: { _id: mockStudentId, name: 'Test Student' },
          course: mockCourseId,
          instructor: { _id: mockInstructorId, name: 'Test Instructor' }
        }
      ];

      Course.findById.mockResolvedValue({ _id: mockCourseId });
      
      const populateLastMock = jest.fn().mockResolvedValue(mockEnrollments);
      const populateFirstMock = jest.fn().mockReturnValue({ populate: populateLastMock });
      const limitMock = jest.fn().mockReturnValue({ populate: populateFirstMock });
      const skipMock = jest.fn().mockReturnValue({ limit: limitMock });
      
      Enrollment.find.mockReturnValue({
        skip: skipMock
      });

      Enrollment.countDocuments.mockResolvedValue(1);

      const response = await request(app)
        .get(`/api/enrollments/course/${mockCourseId}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.enrollments).toHaveLength(1);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.totalCount).toBe(1);
    });

    it('should return 404 when course not found', async () => {
      Course.findById.mockResolvedValue(null);

      await request(app)
        .get(`/api/enrollments/course/${mockCourseId}`)
        .expect(404);
    });
  });

  describe('DELETE /api/enrollments/:enrollmentId', () => {
    it('should successfully cancel an enrollment', async () => {
      Enrollment.findByIdAndDelete.mockResolvedValue({
        _id: mockEnrollmentId,
        student: mockStudentId,
        course: mockCourseId
      });

      await request(app)
        .delete(`/api/enrollments/${mockEnrollmentId}`)
        .expect(200);
    });

    it('should return 404 when enrollment not found', async () => {
      Enrollment.findByIdAndDelete.mockResolvedValue(null);

      await request(app)
        .delete(`/api/enrollments/${mockEnrollmentId}`)
        .expect(404);
    });
  });
});