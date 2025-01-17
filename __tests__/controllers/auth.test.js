
const { register, login, passwordResetRequest, passwordReset, logout } = require('../../controllers/authController');
const User = require('../../models/instructorModel');
const Student = require('../../models/studentModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendPasswordResetEmail = require('../../services/emailService');
const logger = require('../../logger');

// Mocks
jest.mock('../../models/instructorModel');
jest.mock('../../models/studentModel');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../services/emailService');
jest.mock('../../logger');


describe('AuthController Tests', () => {

    describe('register', () => {
        it('should register a new user successfully', async () => {
            const req = {
                body: {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com',
                    phoneNumber: '1234567890',
                    department: 'Computer Science',
                    officeLocation: 'Building A',
                    password: 'password123',
                },
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            User.findOne.mockResolvedValue(null);

            bcrypt.hash.mockResolvedValue('hashedPassword');

            User.prototype.save.mockResolvedValue(true);

            await register(req, res);

            expect(User.findOne).toHaveBeenCalledWith({ email: 'john.doe@example.com' });
            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
            expect(User.prototype.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ message: 'Registration successful!' });
        });

        it('should return an error if email already exists', async () => {
            const req = {
                body: {
                    email: 'john.doe@example.com',
                },
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            User.findOne.mockResolvedValue({});

            await register(req, res);

            expect(User.findOne).toHaveBeenCalledWith({ email: 'john.doe@example.com' });
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Email already registered' });
        });

        it('should handle errors during registration', async () => {
            const req = { body: {} };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            User.findOne.mockRejectedValue(new Error('Some database error'));

            await register(req, res);

            expect(logger.error).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Error! Unable to register',
                error: 'Some database error',
            });
        });
    });

    describe('login', () => {
        it('should login successfully with correct credentials', async () => {
            const req = {
                body: {
                    email: 'john.doe@example.com',
                    password: 'password123',
                },
            };
            const res = {
                json: jest.fn(),
            };

            User.findOne.mockResolvedValue({
                id: '12345',
                password: 'hashedPassword',
            });

            bcrypt.compare.mockResolvedValue(true);

            jwt.sign.mockReturnValue('jwtToken');

            await login(req, res);

            expect(User.findOne).toHaveBeenCalledWith({ email: 'john.doe@example.com' });
            expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
            expect(jwt.sign).toHaveBeenCalledWith(
                { id: '12345', role: 'instructor' },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );
            expect(res.json).toHaveBeenCalledWith({
                message: 'Login successful',
                token: 'jwtToken',
            });
        });

        it('should return error if email does not exist', async () => {
            const req = {
                body: {
                    email: 'nonexistent@example.com',
                    password: 'password123',
                },
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            User.findOne.mockResolvedValue(null);

            await login(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Invalid email or password',
            });
        });

        it('should return error if password is incorrect', async () => {
            const req = {
                body: {
                    email: 'john.doe@example.com',
                    password: 'wrongpassword',
                },
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            User.findOne.mockResolvedValue({
                id: '12345',
                password: 'hashedPassword',
            });

            bcrypt.compare.mockResolvedValue(false);

            await login(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Invalid email or password',
            });
        });
    });

    describe('passwordResetRequest', () => {
        it('should send password reset email for instructor', async () => {
            const req = {
                body: { email: 'instructor@example.com', role: 'instructor' },
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            User.findOne.mockResolvedValue({ id: '12345' });

            jwt.sign.mockReturnValue('jwtToken');

            sendPasswordResetEmail.mockResolvedValue(true);

            await passwordResetRequest(req, res);

            expect(User.findOne).toHaveBeenCalledWith({ email: 'instructor@example.com' });
            expect(jwt.sign).toHaveBeenCalledWith(
                { id: '12345', role: 'instructor' },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );
            expect(sendPasswordResetEmail).toHaveBeenCalledWith(
                'instructor@example.com',
                'jwtToken',
                req
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Password reset email sent!',
                token: 'jwtToken',
            });
        });

        it('should return error if email not found', async () => {
            const req = {
                body: { email: 'nonexistent@example.com', role: 'instructor' },
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            User.findOne.mockResolvedValue(null);

            await passwordResetRequest(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Email not found' });
        });
    });

    describe('passwordReset', () => {
        it('should reset password successfully', async () => {
            const req = {
                body: { token: 'validToken', newPassword: 'newPassword123' },
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
    
            jwt.verify.mockReturnValue({ id: '12345', role: 'instructor' });
    
            const mockUser = { id: '12345', password: 'oldPassword', save: jest.fn() };
            User.findById.mockResolvedValue(mockUser);
    
            bcrypt.hash.mockResolvedValue('newHashedPassword');
    
            await passwordReset(req, res);
    
            expect(User.findById).toHaveBeenCalledWith({ _id: '12345' });
    
            expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 10);
    
            expect(mockUser.save).toHaveBeenCalled();
    
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Password successfully updated.' });
        });
    
        it('should return error if token is invalid', async () => {
            const req = {
                body: { token: 'invalidToken', newPassword: 'newPassword123' },
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
    
            jwt.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });
    
            await passwordReset(req, res);
    
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Error resetting password',
                error: 'Invalid token',
            });
        });
    });
    
    describe('logout', () => {
        it('should return success message for logout', async () => {
            const req = {};
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            await logout(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Logout successful' });
        });
    });

});
