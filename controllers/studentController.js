const logger = require('../logger');
const Student = require('../models/studentModel');
const Counter = require('../models/idCounterModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { initRedis } = require('../services/redisService')



exports.login = async (req, res) => {
  
  const { email, password } = req.body;

  try {
      const student = await Student.findOne({email});
      
      if (!student) {
          return res.status(400).json({ message: 'Invalid email or password' });
      }

      const isPasswordValid = await bcrypt.compare(password, student.password);

      if (!isPasswordValid) {
          return res.status(400).json({ message: 'Invalid email or password' });
      }

      const token = jwt.sign({ id: student.id, role: 'student' }, process.env.JWT_SECRET, { expiresIn: '1d' });

      res.json({ message: 'Login successful', token });

  } catch (error) {
      console.error(error); 
      res.status(500).json({ message: 'Error logging in', error: error.message });
  }

};



exports.getAllStudents = async (req, res) => {
  try {
    // Initializing Redis client
    const client = await initRedis();

    // Extracting filters
    const filters = {};
    if (req.query.firstName) filters.firstName = req.query.firstName;
    if (req.query.lastName) filters.lastName = req.query.lastName;
    if (req.query.gender) filters.gender = req.query.gender;
    if (req.query.status) filters.status = req.query.status;

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit; //Based on the page number

    // Constructing cache key based on filters, page, and limit
    const cacheKey = `students:${JSON.stringify(filters)}:page=${page}:limit=${limit}`;
    const cachedData = await client.get(cacheKey);

    if (cachedData) {
      logger.info('Returning cached data');
      return res.status(200).json(JSON.parse(cachedData));
    }

    // If no cache
    const students = await Student.find(filters)
      .skip(skip) 
      .limit(limit);

    const totalCount = await Student.countDocuments(filters);

    if (students.length === 0) {
      return res.status(204).json(students);
    }

    // Pagination metadata
    const pagination = {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      limit,
    };

    await client.set(cacheKey, JSON.stringify(students), 'EX', 3600); 
    logger.info(`Cached students data with key: ${cacheKey}`);

    res.status(200).json({
      students,
      pagination,
    });

  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};



exports.getStudentById = async (req, res) => {
  try {
    //Restrict student to access self details
    if(req.user.role === 'student' && req.user.id != req.params.id){
      return res.status(401).json({message: 'Only self access allowed!'});
    } 

    const student = await Student.findById(req.params.id);

    if (!student) return res.status(404).json({ message: 'Student not found' });

    res.status(200).json(student);

  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};


// Function to generate the student ID
async function generateStudentId() {
    let counter = await Counter.findOneAndUpdate(
      { name: 'studentId' },
      { $inc: { currentValue: 1 } },
      { new: true, upsert: true }
    );
  
    return `ETUD${counter.currentValue.toString().padStart(6, '0')}`;
  }



exports.createStudent = async (req, res) => {
  try {
    // Generate a unique student ID
    const studentId = await generateStudentId();

    const { firstName, lastName, dateOfBirth, gender, email, phoneNumber, address, status } = req.body;
    const newStudent = new Student({
      studentId,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      email,
      phoneNumber,
      address,
      status
    });

    await newStudent.save();
    res.status(201).json(newStudent);
  } catch (error) {
    res.status(500).json({ message: 'Error creating student', error });
  }
};



exports.updateStudent = async (req, res) => {
  try {
    //Restrict student to update self details
    if(req.user.role === 'student' && req.user.id != req.params.id){
      return res.status(401).json({message: 'Only self access allowed!'});
    }

    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: 'Error updating student', error });
  }
};



exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting student', error });
  }
};
