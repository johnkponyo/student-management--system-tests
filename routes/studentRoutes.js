const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { body } = require('express-validator');
const { validate } = require('../middlewares/validatorMiddleware');
const { authenticateAll, authenticateInstructors } = require('../middlewares/authMiddleware');



/**
 * @swagger
 * tags:
 *   - name: Student Management
 *     description: Endpoints for managing students
 */

/**
 * @swagger
 * /students/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Student login
 *     description: Login a student by providing email and password.
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
router.post('/login', studentController.login);



/**
 * @swagger
 * /students:
 *   get:
 *     tags:
 *       - Student Management
 *     summary: Retrieve all students
 *     description: Retrieve a list of all students with optional query parameters to filter results.
 *     parameters:
 *       - name: firstName
 *         in: query
 *         description: Filter by student's first name.
 *         required: false
 *         schema:
 *           type: string
 *       - name: lastName
 *         in: query
 *         description: Filter by student's last name.
 *         required: false
 *         schema:
 *           type: string
 *       - name: gender
 *         in: query
 *         description: Filter by student's gender.
 *         required: false
 *         schema:
 *           type: string
 *           enum: [Male, Female, Other]
 *       - name: status
 *         in: query
 *         description: Filter by student's status (Active or Inactive).
 *         required: false
 *         schema:
 *           type: string
 *           enum: [Active, Inactive]
 *     responses:
 *       200:
 *         description: A list of students
 *       204:
 *         description: No students found
 *       500:
 *         description: Server error
 */
router.get('/', authenticateInstructors, studentController.getAllStudents);



/**
 * @swagger
 * /students/{id}:
 *   get:
 *     tags:
 *       - Student Management
 *     summary: Retrieve a student's details
 *     description: Retrieve a specific student's details by their ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the student to retrieve.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful retrieval of student details
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authenticateAll, studentController.getStudentById);



/**
 * @swagger
 * /students:
 *   post:
 *     tags:
 *       - Student Management
 *     summary: Create a new student
 *     description: Create a new student with the provided details.
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
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *               email:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               address:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive]
 *             required:
 *               - firstName
 *               - lastName
 *               - dateOfBirth
 *               - gender
 *               - email
 *               - phoneNumber
 *               - address
 *               - status
 *     responses:
 *       201:
 *         description: Student successfully created
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post(
    '/',
    authenticateInstructors,
    [
        body('firstName')
            .isLength({ min: 1 }).withMessage('First name is required')
            .isAlpha().withMessage('First name must contain only letters'),
        body('lastName')
            .isLength({ min: 1 }).withMessage('Last name is required')
            .isAlpha().withMessage('Last name must contain only letters'),
        body('dateOfBirth')
            .isDate({ format: 'YYYY-MM-DD' }).withMessage('Date of birth must be a valid date in YYYY-MM-DD format'),
        body('gender')
            .isIn(['Male', 'Female', 'Other']).withMessage('Gender must be one of the following: male, female, or other'),
        body('email')
            .isEmail().withMessage('Email must be a valid email address'),
        body('phoneNumber')
            .isMobilePhone().withMessage('Phone number must be a valid mobile number'),
        body('address')
            .isLength({ min: 1 }).withMessage('Address is required'),
        body('status')
            .isIn(['Active', 'Inactive']).withMessage('Status must be either active or inactive'),
    ],
    validate, 
    studentController.createStudent
);



/**
 * @swagger
 * /students/{id}:
 *   put:
 *     tags:
 *       - Student Management
 *     summary: Update an existing student's details
 *     description: Update the details of a student by their ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the student to update.
 *         required: true
 *         schema:
 *           type: string
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
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *               email:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               address:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive]
 *             required:
 *               - firstName
 *               - lastName
 *               - dateOfBirth
 *               - gender
 *               - email
 *               - phoneNumber
 *               - address
 *               - status
 *     responses:
 *       200:
 *         description: Student details successfully updated
 *       400:
 *         description: Invalid input or validation error
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server error
 */
router.put('/:id', authenticateAll, studentController.updateStudent);



/**
 * @swagger
 * /students/{id}:
 *   delete:
 *     tags:
 *       - Student Management
 *     summary: Delete a student
 *     description: Delete a student by their ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the student to delete.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student successfully deleted
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticateInstructors, studentController.deleteStudent);



module.exports = router;
