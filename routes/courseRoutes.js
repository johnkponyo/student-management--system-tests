const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { body } = require('express-validator');
const { validate } = require('../middlewares/validatorMiddleware')
const { authenticateAll, authenticateInstructors } = require('../middlewares/authMiddleware');



/**
 * @swagger
 * tags:
 *   - name: Course Management
 *     description: Endpoints for managing courses
 */

/**
 * @swagger
 * /courses:
 *   get:
 *     tags:
 *       - Course Management
 *     summary: List all courses
 *     description: Retrieve a list of all courses, with optional filtering by department and semester.
 *     parameters:
 *       - name: department
 *         in: query
 *         description: Filter courses by department
 *         required: false
 *         schema:
 *           type: string
 *       - name: semester
 *         in: query
 *         description: Filter courses by semester
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - Fall
 *             - Spring
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of courses
 *       500:
 *         description: Server error
 */
router.get('/', authenticateAll, courseController.getAllCourses);



/**
 * @swagger
 * /courses/{courseCode}:
 *   get:
 *     tags:
 *       - Course Management
 *     summary: Retrieve specific course details
 *     description: Retrieve details of a specific course by its course code.
 *     parameters:
 *       - name: courseCode
 *         in: path
 *         description: The code of the course to retrieve.
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved course details
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
router.get('/:courseCode', authenticateAll, courseController.getCourseByCode);



// 3. POST /courses - Create a new course
/**
 * @swagger
 * /courses:
 *   post:
 *     tags:
 *       - Course Management
 *     summary: Create a new course
 *     description: Allows an instructor to create a new course with details such as course code, name, description, credits, semester, and department.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               courseCode:
 *                 type: string
 *               courseName:
 *                 type: string
 *               courseDescription:
 *                 type: string
 *               credits:
 *                 type: integer
 *               semester:
 *                 type: string
 *                 enum:
 *                   - Fall
 *                   - Spring
 *               department:
 *                 type: string
 *             required:
 *               - courseCode
 *               - courseName
 *               - courseDescription
 *               - credits
 *               - semester
 *               - department
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: Course successfully created
 *       400:
 *         description: Validation errors
 *       500:
 *         description: Server error
 */
router.post(
    '/',
    authenticateInstructors,
    [
        body('courseCode')
            .isLength({ min: 1 }).withMessage('Course code is required')
            .isAlphanumeric().withMessage('Course code must contain only letters and numbers'),
        body('courseName')
            .isLength({ min: 1 }).withMessage('Course name is required')
            .isString().withMessage('Course name must be a string'),
        body('courseDescription')
            .isLength({ min: 10 }).withMessage('Course description must be at least 10 characters long'),
        body('credits')
            .isInt({ min: 1, max: 3 }).withMessage('Credits must be an integer between 1 and 3'),
        body('semester')
            .isIn(['Fall', 'Spring']).withMessage('Semester must be either Fall or Spring'),
        body('department')
            .isLength({ min: 1 }).withMessage('Department is required')
            .isString().withMessage('Department must be a string'),
    ], 
    validate,
    courseController.createCourse
);



/**
 * @swagger
 * /courses/{courseCode}:
 *   put:
 *     tags:
 *       - Course Management
 *     summary: Update course information
 *     description: Update the details of an existing course by its course code.
 *     parameters:
 *       - name: courseCode
 *         in: path
 *         description: The course code of the course to update.
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
 *               courseCode:
 *                 type: string
 *               courseName:
 *                 type: string
 *               courseDescription:
 *                 type: string
 *               credits:
 *                 type: integer
 *               semester:
 *                 type: string
 *                 enum:
 *                   - Fall
 *                   - Spring
 *               department:
 *                 type: string
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Course information updated successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
router.put('/:courseCode', authenticateInstructors, courseController.updateCourse);



/**
 * @swagger
 * /courses/{courseCode}:
 *   delete:
 *     tags:
 *       - Course Management
 *     summary: Remove course from catalog
 *     description: Delete a course from the course catalog using its course code.
 *     parameters:
 *       - name: courseCode
 *         in: path
 *         description: The course code of the course to delete.
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Course deleted successfully
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
router.delete('/:courseCode', authenticateInstructors, courseController.deleteCourse);



module.exports = router;
