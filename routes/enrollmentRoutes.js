const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const { body } = require('express-validator');
const { validate } = require('../middlewares/validatorMiddleware')
const { authenticateAll, authenticateInstructors } = require('../middlewares/authMiddleware');



/**
 * @swagger
 * tags:
 *   - name: Enrollment Management
 *     description: Endpoints for managing enrollments
 */

/**
 * @swagger
 * /enrollments:
 *   post:
 *     tags:
 *       - Enrollment Management
 *     summary: Enroll a student in a course
 *     description: Enroll a student in a specific course, requiring student ID, course ID, and instructor ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: string
 *               courseId:
 *                 type: string
 *               instructorId:
 *                 type: string
 *             required:
 *               - studentId
 *               - courseId
 *               - instructorId
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: Successfully enrolled student in course
 *       400:
 *         description: Validation errors (invalid student ID, course ID, or instructor ID)
 *       500:
 *         description: Server error
 */
router.post(
    '/',
    authenticateAll, 
    [
        body('studentId')
            .isLength({ min: 1 }).withMessage('Student ID is required')
            .isMongoId().withMessage('Student ID must be a valid MongoDB ObjectId'),
        body('courseId')
            .isLength({ min: 1 }).withMessage('Course ID is required')
            .isMongoId().withMessage('Course ID must be a valid MongoDB ObjectId'),
        body('instructorId')
            .isLength({ min: 1 }).withMessage('Instructor ID is required')
            .isMongoId().withMessage('Instructor ID must be a valid MongoDB ObjectId'),
    ],
    validate,
    enrollmentController.enrollStudentInCourse
);



/**
 * @swagger
 * /enrollments/student/{studentId}:
 *   get:
 *     tags:
 *       - Enrollment Management
 *     summary: Retrieve all courses for a student
 *     description: Retrieve all the courses a student is enrolled in by providing the student ID.
 *     parameters:
 *       - name: studentId
 *         in: path
 *         description: The ID of the student to retrieve their courses.
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved list of courses for the student
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server error
 */
router.get('/student/:studentId', authenticateAll, enrollmentController.getCoursesForStudent);



/**
 * @swagger
 * /enrollments/course/{courseId}:
 *   get:
 *     tags:
 *       - Enrollment Management
 *     summary: Retrieve all students enrolled in a course
 *     description: Retrieve a list of all students enrolled in a specific course by providing the course ID.
 *     parameters:
 *       - name: courseId
 *         in: path
 *         description: The ID of the course to retrieve enrolled students.
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved list of students in the course
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
router.get('/course/:courseId', authenticateInstructors, enrollmentController.getStudentsInCourse);



/**
 * @swagger
 * /enrollments/{enrollmentId}:
 *   delete:
 *     tags:
 *       - Enrollment Management
 *     summary: Cancel specific enrollment
 *     description: Cancel the enrollment for a specific student in a course using the enrollment ID.
 *     parameters:
 *       - name: enrollmentId
 *         in: path
 *         description: The ID of the enrollment to cancel.
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully canceled enrollment
 *       404:
 *         description: Enrollment not found
 *       500:
 *         description: Server error
 */
router.delete('/:enrollmentId', authenticateAll, enrollmentController.cancelEnrollment);



module.exports = router;
