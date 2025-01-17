const Course = require('../models/courseModel');
const logger = require('../logger');
const { initRedis } = require('../services/redisService')



exports.getAllCourses = async (req, res) => {
  try {
    // Initializing Redis client
    const client = await initRedis();

    const { department, semester } = req.query;
    let filter = {};

    // Applying filters
    if (department) filter.department = department;
    if (semester) filter.semester = semester;

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const cacheKey = `courses:${JSON.stringify(filter)}:page=${page}:limit=${limit}`;
    const cachedData = await client.get(cacheKey);

    if (cachedData) {
      logger.info('Returning cached courses data');
      return res.status(200).json(JSON.parse(cachedData));
    }

    const courses = await Course.find(filter)
      .skip(skip)
      .limit(limit);

    const totalCount = await Course.countDocuments(filter);

    if (courses.length === 0) {
      return res.status(204).json(courses);
    }

    //Pagination metadata
    const pagination = {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      limit,
    };

    await client.set(cacheKey, JSON.stringify(courses), 'EX', 3600);
    logger.info(`Cached courses data with key: ${cacheKey}`);

    res.status(200).json({
      courses,
      pagination,
    });

  } catch (error) {
    console.error('Error retrieving courses:', error);
    res.status(500).json({ message: 'Error retrieving courses', error });
  }
};



exports.getCourseByCode = async (req, res) => {
  try {
    const courseCode = req.params.courseCode;
    const course = await Course.findOne({ courseCode });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving course', error });
  }
};



exports.createCourse = async (req, res) => {
  try {
    const { courseCode, courseName, courseDescription, credits, semester, department } = req.body;

    const exists = await Course.findOne({courseCode});
    if(exists){
      return res.status(409).json({message: 'Course already exists!'})
    }

    const newCourse = new Course({
      courseCode,
      courseName,
      courseDescription,
      credits,
      semester,
      department
    });

    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (error) {
    res.status(500).json({ message: 'Error creating course', error });
  }
};



exports.updateCourse = async (req, res) => {
  try {
    const courseCode = req.params.courseCode;
    const updatedCourse = await Course.findOneAndUpdate({ courseCode }, req.body, { new: true });

    if (!updatedCourse) return res.status(404).json({ message: 'Course not found' });

    res.status(200).json(updatedCourse);
  } catch (error) {
    res.status(500).json({ message: 'Error updating course', error });
  }
};



exports.deleteCourse = async (req, res) => {
  try {
    const courseCode = req.params.courseCode;
    const deletedCourse = await Course.findOneAndDelete({ courseCode });

    if (!deletedCourse) return res.status(404).json({ message: 'Course not found' });

    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting course', error });
  }
};
