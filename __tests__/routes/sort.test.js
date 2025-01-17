const { app, server } = require('../../app');
const request = require('supertest');
const sortController = require('../../controllers/sortController');
const { authenticateInstructors } = require('../../middlewares/authMiddleware');

// Mocks
jest.mock('../../controllers/sortController');
jest.mock('../../middlewares/authMiddleware');

describe('Tests for sort routes', () => {

    afterAll(() => {
        //server.close(); 
    });

  describe('GET /api/sort/students', () => {
    it('should call sortStudents with the correct query parameters', async () => {
      
     authenticateInstructors.mockImplementation((req, res, next) => {
        if (!req.header('Authorization')) {
          return res.status(401).json({ message: 'Access denied. No token provided.' });
        }
        next();
      });
        
      sortController.sortStudents.mockImplementation(async (req, res) => {
        res.status(200).json({
          students: [],
          pagination: {
            totalCount: 0,
            totalPages: 0,
            currentPage: 1,
            limit: 10,
          },
        });
      });

      const response = await request(app)
        .get('/api/sort/students')
        .query({ criterion: 'lastName', order: 'asc', algorithm: 'quick', page: 1, limit: 10 })
        .set('Authorization', 'Bearer mock_token');

      expect(response.status).toBe(200);
      expect(response.body.students).toEqual([]);
      expect(response.body.pagination.totalCount).toBe(0);
      expect(sortController.sortStudents).toHaveBeenCalled();
    });

    it('should return an error if no token is provided', async () => {
      const response = await request(app)
        .get('/api/sort/students')
        .query({ criterion: 'lastName', order: 'asc', algorithm: 'quick', page: 1, limit: 10 });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Access denied. No token provided.');
    });
  });

  describe('GET /api/sort/courses', () => {
    it('should call sortCourses with the correct query parameters', async () => {
      
        authenticateInstructors.mockImplementation((req, res, next) => {
            if (!req.header('Authorization')) {
              return res.status(401).json({ message: 'Access denied. No token provided.' });
            }
            next();
        });
        
          
      sortController.sortCourses.mockImplementation(async (req, res) => {
        res.status(200).json({
          courses: [],
          pagination: {
            totalCount: 0,
            totalPages: 0,
            currentPage: 1,
            limit: 10,
          },
        });
      });

      const response = await request(app)
        .get('/api/sort/courses')
        .query({ criterion: 'courseName', order: 'asc', algorithm: 'quick', page: 1, limit: 10 })
        .set('Authorization', 'Bearer mock_token');

      expect(response.status).toBe(200);
      expect(response.body.courses).toEqual([]);
      expect(response.body.pagination.totalCount).toBe(0);
      expect(sortController.sortCourses).toHaveBeenCalled();
    });

    it('should return an error if no token is provided', async () => {
      const response = await request(app)
        .get('/api/sort/courses')
        .query({ criterion: 'courseName', order: 'asc', algorithm: 'quick', page: 1, limit: 10 });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Access denied. No token provided.');
    });
  });
});
