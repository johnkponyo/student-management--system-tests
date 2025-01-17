const jwt = require('jsonwebtoken');
const { authenticateAll, authenticateInstructors } = require('../../middlewares/authMiddleware'); 

jest.mock('jsonwebtoken'); 

describe('Tests for authentication middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      header: jest.fn(),
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });



  describe('authenticateAll Middleware', () => {
    it('should return 401 if no token is provided', async () => {
      req.header.mockReturnValue(undefined);  // Simulating no Authorization header

      await authenticateAll(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Access denied. No token provided.' });
    });

    it('should return 400 if the token is invalid or verification fails', async () => {
      req.header.mockReturnValue('Bearer invalidToken');
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');  // Simulating token verification failure
      });

      await authenticateAll(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
    });

    it('should call next() if the token is valid', async () => {
      const decodedToken = { role: 'instructor' };  // Simulating a decoded token
      req.header.mockReturnValue('Bearer validToken');
      jwt.verify.mockReturnValue(decodedToken); 

      await authenticateAll(req, res, next);

      expect(next).toHaveBeenCalled();  // Calling next() if the token is valid 
    });
  });



  describe('authenticateInstructors Middleware', () => {
    it('should return 401 if no token is provided', async () => {
      req.header.mockReturnValue(undefined);  // Simulating no Authorization header

      await authenticateInstructors(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Access denied. No token provided.' });
    });

    it('should return 400 if the token is invalid or verification fails', async () => {
      req.header.mockReturnValue('Bearer invalidToken');
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');  // Simulating token verification failure
      });

      await authenticateInstructors(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
    });

    it('should return 401 if the token role is not "instructor"', async () => {
      const decodedToken = { role: 'student' };  // Simulating a decoded token with a role of 'student'
      req.header.mockReturnValue('Bearer validToken');
      jwt.verify.mockReturnValue(decodedToken);

      await authenticateInstructors(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Access denied. Only instructors allowed!.' });
    });

    it('should call next() if the token is valid and the role is "instructor"', async () => {
      const decodedToken = { role: 'instructor' };  // Simulating a valid decoded token
      req.header.mockReturnValue('Bearer validToken');
      jwt.verify.mockReturnValue(decodedToken); 

      await authenticateInstructors(req, res, next);

      expect(next).toHaveBeenCalled();  // Calling next() if the token is valid and the role is 'instructor'
    });
  });
});
