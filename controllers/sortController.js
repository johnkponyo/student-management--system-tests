const { quickSort, mergeSort } = require('../utils/sortingAlgorithms');
const Student = require('../models/studentModel');
const Course = require('../models/courseModel');



// Comparing by last name
const compareByName = (a, b, order) => {
  const comparison = a.lastName.localeCompare(b.lastName);
  return order === 'asc' ? comparison : -comparison;
};



// Sorting function for courses by course name
const compareByCourseName = (a, b, order) => {
  const comparison = a.courseName.localeCompare(b.courseName);
  return order === 'asc' ? comparison : -comparison;
};



exports.sortStudents = async (req, res) => {

  try {

    const { criterion, order = 'asc', algorithm, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const students = await Student.find();

    let sortedStudents = [];
    
    if (criterion === 'lastName') {
      sortedStudents = algorithm === 'quick' 
        ? quickSort(students, (a, b) => compareByName(a, b, order)) 
        : mergeSort(students, (a, b) => compareByName(a, b, order));
    } else {
      return res.status(400).json({ message: 'Invalid sorting criterion' });
    }

    // Apply pagination
    const paginatedStudents = sortedStudents.slice(skip, skip + limit);

    // Pagination metadata
    const totalCount = sortedStudents.length; 

    const pagination = {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: parseInt(page),
      limit: parseInt(limit),
    };

    res.status(200).json({
      students: paginatedStudents,
      pagination,
    });

  } catch (error) {
    res.status(500).json({ message: 'Error sorting students', error });
  }

};



exports.sortCourses = async (req, res) => {
  try {
    const { criterion, order = 'asc', algorithm, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const courses = await Course.find();

    let sortedCourses = [];

    // Determining the sorting function based on the criterion
    if (criterion === 'courseName') {
      sortedCourses = algorithm === 'quick' 
        ? quickSort(courses, (a, b) => compareByCourseName(a, b, order)) 
        : mergeSort(courses, (a, b) => compareByCourseName(a, b, order));
    } else {
      return res.status(400).json({ message: 'Invalid sorting criterion' });
    }

    const paginatedCourses = sortedCourses.slice(skip, skip + limit);

    const totalCount = sortedCourses.length;

    const pagination = {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: parseInt(page),
      limit: parseInt(limit),
    };

    res.status(200).json({
      courses: paginatedCourses,
      pagination,
    });

  } catch (error) {
    res.status(500).json({ message: 'Error sorting courses', error });
  }
};

