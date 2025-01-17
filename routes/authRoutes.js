const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { body } = require('express-validator');
const { validate } = require('../middlewares/validatorMiddleware');
const { authenticateAll } = require('../middlewares/authMiddleware');



/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: Authentication and authorization endpoints
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new instructor
 *     description: Registers an instructor with the provided information.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               department:
 *                 type: string
 *               officeLocation:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - phoneNumber
 *               - department
 *               - officeLocation
 *               - password
 *     responses:
 *       201:
 *         description: Instructor successfully registered
 *       400:
 *         description: Validation errors
 *       500:
 *         description: Server error
 */
router.post(
    '/register',
    [
        body('firstName')
            .isLength({ min: 1 }).withMessage('First name is required')
            .isAlpha().withMessage('First name must contain only letters'),
        
        body('lastName')
            .isLength({ min: 1 }).withMessage('Last name is required')
            .isAlpha().withMessage('Last name must contain only letters'),
        
        body('email')
            .isEmail().withMessage('Please provide a valid email address')
            .normalizeEmail(),
        body('phoneNumber')
            .isLength({ min: 10 }).withMessage('Phone number must be at least 10 characters long')
            .isNumeric().withMessage('Phone number must contain only numbers'),
        
        body('department')
            .isLength({ min: 1 }).withMessage('Department is required'),
        body('officeLocation')
            .isAlpha().withMessage('Office location must contain only letters'),
        body('password')
            .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
            .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
            .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
            .matches(/\d/).withMessage('Password must contain at least one number')
            .matches(/[\W_]/).withMessage('Password must contain at least one special character') 
    ],
    validate, 
    authController.register
);



/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login an instructor
 *     description: Login an instructor by providing email and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Successful login
 *       400:
 *         description: Invalid email or password
 *       500:
 *         description: Server error
 */
router.post('/login', authController.login);



/**
 * @swagger
 * /auth/password-reset-request:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Request password reset
 *     description: Request a password reset email to be sent.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: Password reset request sent successfully
 *       400:
 *         description: Invalid email address
 *       500:
 *         description: Server error
 */
router.post('/password-reset-request', authController.passwordResetRequest);



/**
 * @swagger
 * /auth/password-reset:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Reset the password
 *     description: Reset the instructor's password with a new password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPassword:
 *                 type: string
 *             required:
 *               - newPassword
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid password format or mismatched new password
 *       500:
 *         description: Server error
 */
router.post(
    '/password-reset',
    [
      body('newPassword')
          .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
          .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
          .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
          .matches(/\d/).withMessage('Password must contain at least one number')
          .matches(/[\W_]/).withMessage('Password must contain at least one special character')
    ],
    validate,
    authController.passwordReset 
);



/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Logout an instructor
 *     description: Logout the currently authenticated instructor.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *       500:
 *         description: Server error
 */
router.post('/logout', authenticateAll, authController.logout);



module.exports = router;
