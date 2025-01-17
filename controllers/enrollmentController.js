const Enrollment = require('../models/enrollmentModel');
const Student = require('../models/studentModel');
const Course = require('../models/courseModel');
const Instructor = require('../models/instructorModel');
const { initRedis } = require('../services/redisService')
const logger = require('../logger');



exports.enrollStudentInCourse = async (req, res) => {

  try {
    const { studentId, courseId, instructorId } = req.body;

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const course = await Course.findById(courseId);

    if (!course) return res.status(404).json({ message: 'Course not found' });

    const instructor = await Instructor.findById(instructorId);
    if (!instructor) return res.status(404).json({ message: 'Instructor not found' });

    const newEnrollment = new Enrollment({
      student: studentId,
      course: courseId,
      instructor: instructorId,
      status: 'Active'
    });

    await newEnrollment.save();

    res.status(201).json(newEnrollment);

  } catch (error) {
    res.status(500).json({ message: 'Error enrolling student', error });
  }
};



exports.getCoursesForStudent = async (req, res) => {
  try {
    const studentId = req.params.studentId;

    const enrollments = await Enrollment.find({ student: studentId })
      .populate('course') 
      .populate('instructor');

    if (enrollments.length === 0) return res.status(404).json({ message: 'No courses found for this student' });

    res.status(200).json(enrollments);

  } catch (error) {
    res.status(500).json({ message: 'Error retrieving courses for student', error });
  }
};



exports.getStudentsInCourse = async (req, res) => {
  try {

    const client = await initRedis();

    const courseId = req.params.courseId;

    const page = parseInt(req.query.page) || 1; 
    const limit = parseInt(req.query.limit) || 10; 
    const skip = (page - 1) * limit;

    const cacheKey = `studentsInCourse:${courseId}:page=${page}:limit=${limit}`;
    const cachedData = await client.get(cacheKey);

    if (cachedData) {
      logger.info('Returning cached students data for course');
      return res.status(200).json(JSON.parse(cachedData));
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const enrollments = await Enrollment.find({ course: course._id })
      .skip(skip)
      .limit(limit)
      .populate('student')
      .populate('instructor');

    if (enrollments.length === 0) {
      return res.status(404).json({ message: 'No students enrolled in this course' });
    }

    const totalCount = await Enrollment.countDocuments({ course: course._id });

    // Pagination metadata
    const pagination = {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      limit,
    };

    await client.set(cacheKey, JSON.stringify(enrollments), 'EX', 3600);
    console.log(`Cached students data for course ${courseId} with key: ${cacheKey}`);

    res.status(200).json({
      enrollments,
      pagination,
    });

  } catch (error) {
    console.error('Error retrieving students in course:', error);
    res.status(500).json({ message: 'Error retrieving students in course', error });
  }

};



exports.cancelEnrollment = async (req, res) => {
  try {
    const enrollmentId = req.params.enrollmentId;

    const enrollment = await Enrollment.findByIdAndDelete(enrollmentId);

    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });

    res.status(200).json({ message: 'Enrollment canceled successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Error canceling enrollment', error });
  }
};
