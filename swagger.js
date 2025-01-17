const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Basic Swagger Configuration
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Student Management System API',
    version: '1.0.0',
    description: 'API documentation for the Student Management System',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local API Server',
    },
  ],
  components: {
    schemas: {
      Instructor: {
        type: 'object',
        properties: {
          firstName: {
            type: 'string',
            description: 'The first name of the instructor',
          },
          lastName: {
            type: 'string',
            description: 'The last name of the instructor',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'The email of the instructor',
          },
          phoneNumber: {
            type: 'string',
            description: 'The phone number of the instructor',
          },
          department: {
            type: 'string',
            description: 'The department to which the instructor belongs',
          },
          officeLocation: {
            type: 'string',
            description: 'The office location of the instructor',
          },
          password: {
            type: 'string',
            description: 'The password for the instructor account (should be hashed)',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Timestamp when the instructor was created',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Timestamp when the instructor was last updated',
          },
        },
        required: ['firstName', 'lastName', 'email', 'phoneNumber', 'department', 'password'],
      },
      Student: {
        type: 'object',
        properties: {
          studentId: {
            type: 'string',
            description: 'The unique ID of the student',
          },
          firstName: {
            type: 'string',
            description: 'The first name of the student',
          },
          lastName: {
            type: 'string',
            description: 'The last name of the student',
          },
          dateOfBirth: {
            type: 'string',
            format: 'date',
            description: 'The date of birth of the student',
          },
          gender: {
            type: 'string',
            enum: ['Male', 'Female', 'Other'],
            description: 'The gender of the student',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'The email of the student',
          },
          phoneNumber: {
            type: 'string',
            description: 'The phone number of the student',
          },
          address: {
            type: 'string',
            description: 'The address of the student',
          },
          enrollmentDate: {
            type: 'string',
            format: 'date-time',
            description: 'The enrollment date of the student',
          },
          status: {
            type: 'string',
            enum: ['Active', 'Inactive'],
            description: 'The current status of the student',
            default: 'Active',
          },
          password: {
            type: 'string',
            description: 'The password for the student account (should be hashed)',
            default: 'xxxxxxxxxx',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Timestamp when the student was created',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Timestamp when the student was last updated',
          },
        },
        required: ['studentId', 'firstName', 'lastName', 'dateOfBirth', 'gender', 'email', 'phoneNumber', 'address', 'password'],
      },
      Course: {
        type: 'object',
        properties: {
          courseCode: {
            type: 'string',
            description: 'The unique course code of the course',
          },
          courseName: {
            type: 'string',
            description: 'The name of the course',
          },
          courseDescription: {
            type: 'string',
            description: 'A brief description of the course content',
          },
          credits: {
            type: 'number',
            description: 'The number of credits the course is worth',
          },
          semester: {
            type: 'string',
            enum: ['Fall', 'Spring'],
            description: 'The semester in which the course is offered',
          },
          department: {
            type: 'string',
            description: 'The department that offers the course',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Timestamp when the course was created',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Timestamp when the course was last updated',
          },
        },
        required: ['courseCode', 'courseName', 'courseDescription', 'credits', 'semester', 'department'],
      },
      Enrollment: {
        type: 'object',
        properties: {
          student: {
            type: 'string',
            description: 'The ID of the student enrolled in the course',
            example: '60d6f4312f6b6c001c8b8d8d',
          },
          course: {
            type: 'string',
            description: 'The ID of the course the student is enrolled in',
            example: '60d6f4312f6b6c001c8b8d8e',
          },
          instructor: {
            type: 'string',
            description: 'The ID of the instructor teaching the course',
            example: '60d6f4312f6b6c001c8b8d8f',
          },
          enrollmentDate: {
            type: 'string',
            format: 'date-time',
            description: 'The date the student enrolled in the course',
            example: '2024-12-17T12:00:00Z',
          },
          grade: {
            type: 'string',
            enum: ['A', 'B', 'C', 'D', 'F', 'Incomplete'],
            description: 'The grade of the student in the course',
            default: 'Incomplete',
          },
          status: {
            type: 'string',
            enum: ['Active', 'Completed', 'Withdrawn'],
            description: 'The enrollment status of the student in the course',
            default: 'Active',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Timestamp when the enrollment was created',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Timestamp when the enrollment was last updated',
          },
        },
        required: ['student', 'course', 'instructor'],
      },
      Counter: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'The name of the counter',
            example: 'studentIdCounter',
          },
          currentValue: {
            type: 'number',
            description: 'The current value of the counter',
            example: 1000,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Timestamp when the counter was created',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Timestamp when the counter was last updated',
          },
        },
        required: ['name', 'currentValue'],
      },
    },
  },
};

// Options for the swagger-jsdoc
const options = {
  swaggerDefinition,
  apis: ['./routes/*.js'],  // Path to the route files where Swagger JSDoc comments are located
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

// Function to serve Swagger UI
const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = setupSwagger;
