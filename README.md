# Student Management System - API Tests (Using Jest and Supertest)

**Student Management System**, built with Node.js and Express, featuring secure authentication, student and course management, and enrollment processes. The system includes multiple sorting functionalities and a comprehensive testing suite to ensure reliability and robustness.

## Version

- **Version**: 1.0.0

## Table of Contents

- [Description](#description)
- [Running Tests](#running-tests)
- [Test Coverage](#test-coverage)


## Description

The **Student Management System** provides functionalities for managing students, courses, and enrollments. It includes secure authentication for students and instructors, and allows sorting and administrative management of student data and related tasks. A comprehensive test suite has been implemented to ensure the system's functionality and robustness.


## Test Coverage

This project includes a comprehensive test suite to ensure system reliability and performance. The tests cover the following areas:

### 1. Authentication System:
- Testing login, registration, and password reset mechanisms.
- Verifying JWT token generation and validation.

### 2. Student Management:
- Testing CRUD operations for student records.
- Validating data validation and edge cases for student data.

### 3. Course Management:
- Testing CRUD operations for courses.
- Verifying correct course retrieval and manipulation.

### 4. Enrollment Processes:
- Testing the enrollment of students in courses.
- Validating the removal of enrollments and the correct assignment of students to courses.

### 5. Sorting and Filtering:
- Testing the sorting functionalities for both students and courses based on various criteria.

### Testing Approaches:
- **Unit Testing**: Isolated testing of individual components (e.g., data validation, authentication logic).
- **Integration Testing**: Validating interactions between different modules (e.g., student-course enrollment).
- **Performance Testing**: Assessing API response times, database query efficiency, and sorting performance.
- **Security Testing**: Ensuring protection against vulnerabilities such as SQL injection and ensuring input validation and sanitization.


## Running Tests

To run the tests:

```bash
npm test

```
