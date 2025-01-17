const request = require('supertest');
const express = require('express');
const Student = require('../../models/studentModel');
const Course = require('../../models/courseModel');
const { quickSort, mergeSort } = require('../../utils/sortingAlgorithms');
const sortRoutes = require('../../routes/sortRoutes');

// Test app instance
const app = express();
app.use(express.json());
app.use('/api/sort', sortRoutes);

jest.mock('../../models/studentModel');
jest.mock('../../models/courseModel');
jest.mock('../../utils/sortingAlgorithms');

jest.mock('../../middlewares/authMiddleware', () => ({
  authenticateInstructors: (req, res, next) => next()
}));

describe('Sort Controller Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/sort/students', () => {
    const mockStudents = [
      { _id: '1', firstName: 'John', lastName: 'Doe' },
      { _id: '2', firstName: 'Alice', lastName: 'Brown' },
      { _id: '3', firstName: 'Bob', lastName: 'Smith' }
    ];

    beforeEach(() => {
      Student.find.mockResolvedValue(mockStudents);
      quickSort.mockImplementation(arr => [...arr].sort((a, b) => a.lastName.localeCompare(b.lastName)));
      mergeSort.mockImplementation(arr => [...arr].sort((a, b) => a.lastName.localeCompare(b.lastName)));
    });

    it('should sort students by lastName using quickSort', async () => {
      const response = await request(app)
        .get('/api/sort/students')
        .query({
          criterion: 'lastName',
          algorithm: 'quick',
          order: 'asc',
          page: 1,
          limit: 10
        })
        .expect(200);

      expect(response.body).toHaveProperty('students');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.students[0].lastName).toBe('Brown');
      expect(quickSort).toHaveBeenCalled();
    });

    it('should sort students by lastName using mergeSort', async () => {
      const response = await request(app)
        .get('/api/sort/students')
        .query({
          criterion: 'lastName',
          algorithm: 'merge',
          order: 'asc',
          page: 1,
          limit: 10
        })
        .expect(200);

      expect(response.body.students[0].lastName).toBe('Brown');
      expect(mergeSort).toHaveBeenCalled();
    });

    it('should handle descending order', async () => {
      quickSort.mockImplementation(arr => 
        [...arr].sort((a, b) => b.lastName.localeCompare(a.lastName))
      );

      const response = await request(app)
        .get('/api/sort/students')
        .query({
          criterion: 'lastName',
          algorithm: 'quick',
          order: 'desc',
          page: 1,
          limit: 10
        })
        .expect(200);

      expect(response.body.students[0].lastName).toBe('Smith');
    });

    it('should return 400 for invalid criterion', async () => {
      await request(app)
        .get('/api/sort/students')
        .query({
          criterion: 'invalidCriterion',
          algorithm: 'quick'
        })
        .expect(400);
    });

    it('should handle pagination correctly', async () => {
      const response = await request(app)
        .get('/api/sort/students')
        .query({
          criterion: 'lastName',
          algorithm: 'quick',
          page: 1,
          limit: 2
        })
        .expect(200);

      expect(response.body.students).toHaveLength(2);
      expect(response.body.pagination.totalCount).toBe(3);
      expect(response.body.pagination.totalPages).toBe(2);
    });
  });

  describe('GET /api/sort/courses', () => {
    const mockCourses = [
      { _id: '1', courseName: 'Mathematics' },
      { _id: '2', courseName: 'Biology' },
      { _id: '3', courseName: 'Chemistry' }
    ];

    beforeEach(() => {
      Course.find.mockResolvedValue(mockCourses);
      quickSort.mockImplementation(arr => [...arr].sort((a, b) => a.courseName.localeCompare(b.courseName)));
      mergeSort.mockImplementation(arr => [...arr].sort((a, b) => a.courseName.localeCompare(b.courseName)));
    });

    it('should sort courses by courseName using quickSort', async () => {
      const response = await request(app)
        .get('/api/sort/courses')
        .query({
          criterion: 'courseName',
          algorithm: 'quick',
          order: 'asc',
          page: 1,
          limit: 10
        })
        .expect(200);

      expect(response.body).toHaveProperty('courses');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.courses[0].courseName).toBe('Biology');
      expect(quickSort).toHaveBeenCalled();
    });

    it('should sort courses by courseName using mergeSort', async () => {
      const response = await request(app)
        .get('/api/sort/courses')
        .query({
          criterion: 'courseName',
          algorithm: 'merge',
          order: 'asc',
          page: 1,
          limit: 10
        })
        .expect(200);

      expect(response.body.courses[0].courseName).toBe('Biology');
      expect(mergeSort).toHaveBeenCalled();
    });

    it('should handle descending order', async () => {
      quickSort.mockImplementation(arr => 
        [...arr].sort((a, b) => b.courseName.localeCompare(a.courseName))
      );

      const response = await request(app)
        .get('/api/sort/courses')
        .query({
          criterion: 'courseName',
          algorithm: 'quick',
          order: 'desc',
          page: 1,
          limit: 10
        })
        .expect(200);

      expect(response.body.courses[0].courseName).toBe('Mathematics');
    });

    it('should return 400 for invalid criterion', async () => {
      await request(app)
        .get('/api/sort/courses')
        .query({
          criterion: 'invalidCriterion',
          algorithm: 'quick'
        })
        .expect(400);
    });

    it('should handle pagination correctly', async () => {
      const response = await request(app)
        .get('/api/sort/courses')
        .query({
          criterion: 'courseName',
          algorithm: 'quick',
          page: 1,
          limit: 2
        })
        .expect(200);

      expect(response.body.courses).toHaveLength(2);
      expect(response.body.pagination.totalCount).toBe(3);
      expect(response.body.pagination.totalPages).toBe(2);
    });

    it('should handle database errors', async () => {
      Course.find.mockRejectedValue(new Error('Database error'));

      await request(app)
        .get('/api/sort/courses')
        .query({
          criterion: 'courseName',
          algorithm: 'quick'
        })
        .expect(500);
    });
  });
});