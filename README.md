# Student Management System - API

A comprehensive Student Management System built with Node.js and Express. It offers secure authentication, student and course management, and enrollment management. The API also supports sorting and various administrative features to help manage the student data and related tasks effectively.

## Version

- **Version**: 1.0.0

## Table of Contents

- [Description](#description)
- [Installation](#installation)
- [Usage](#usage)
- [Full Documentation](#full-documentation)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [Students Management](#students-management)
  - [Course Management](#course-management)
  - [Enrollment Management](#enrollment-management)
  - [Sort Endpoints](#sort-endpoints)
- [Dependencies](#dependencies)
- [Scripts](#scripts)
- [License](#license)
- [Contributing](#contributing)
- [Author](#author)

## Description

The Student Management System provides a set of features for managing students, courses, and enrollments. It includes authentication endpoints for both students and instructors, as well as capabilities for managing students' details, courses, and enrollments. Additionally, the system supports sorting functionalities for students and courses.

## Installation

To set up the Student Management System, follow these steps:

1. Clone the repository to your local machine:

    ```bash
    git clone https://github.com/johnkponyo/student-management-system
    ```

2. Navigate to the project directory:

    ```bash
    cd student-management-system
    ```

3. Install the necessary dependencies:

    ```bash
    npm install
    ```

4. Set up your environment variables by creating a `.env` file in the root directory and adding the following configurations:

    ```
    DB_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    EMAIL_HOST=your-email-host
    EMAIL_PORT=port
    EMAIL_USER=your-email-user
    EMAIL_PASS=your-email-password
    ```

5. Start the application:

    ```bash
    npm start
    ```

## Usage

Once the application is running, you can access the API through the default URL `http://localhost:3000`. All the functionality provided by the API can be accessed through the following endpoints.

## Full Documentation

Visit the URL `http://localhost:3000/api-docs/` for the complete and detailed API documentation :)

## API Endpoints

### Authentication

- **POST /auth/register-instructor**  
  Registers a new instructor.

- **POST /auth/instructor-login**  
  Logs in an instructor and returns a JWT token.

- **POST /auth/student-login**  
  Logs in a student and returns a JWT token.

- **POST /auth/request-password-reset**  
  Sends a password reset request.

- **POST /auth/reset-password**  
  Resets the student's or instructor's password.

### Students Management

- **GET /students**  
  Retrieves a list of all students.

- **GET /students/:id**  
  Fetches the details of a specific student by their ID.

- **POST /students**  
  Creates a new student.

- **PUT /students/:id**  
  Updates the details of an existing student.

- **DELETE /students/:id**  
  Deletes a student by their ID.

### Course Management

- **GET /courses**  
  Retrieves a list of all courses.

- **GET /courses/:id**  
  Fetches the details of a specific course by its ID.

- **POST /courses**  
  Creates a new course.

- **PUT /courses/:id**  
  Updates the details of an existing course.

- **DELETE /courses/:id**  
  Deletes a course by its ID.

### Enrollment Management

- **POST /enrollments**  
  Enrolls a student in a course.

- **GET /students/:studentId/courses**  
  Fetches all courses a student is enrolled in.

- **GET /courses/:courseId/students**  
  Fetches all students enrolled in a specific course.

- **DELETE /enrollments/:id**  
  Removes a student from a course (deletes an enrollment).

### Sort Endpoints

- **GET /students/sort**  
  Sorts the list of students based on various criteria.

- **GET /courses/sort**  
  Sorts the list of courses based on various criteria.

## Dependencies

This project uses the following dependencies:

- **bcrypt**: A library to hash and compare passwords securely.
- **body-parser**: Middleware to parse incoming request bodies.
- **cors**: Middleware to enable Cross-Origin Resource Sharing (CORS).
- **dotenv**: Loads environment variables from a `.env` file into `process.env`.
- **express**: A fast, unopinionated, minimalist web framework for Node.js.
- **express-rate-limit**: Middleware to limit repeated requests to public APIs.
- **express-validator**: A set of express.js middlewares for validation.
- **helmet**: Helps secure your Express apps by setting various HTTP headers.
- **jsonwebtoken**: A library to create and verify JSON Web Tokens (JWT).
- **mongoose**: A MongoDB object modeling tool designed to work in an asynchronous environment.
- **nodemailer**: A module for sending emails.
- **redis**: A Redis client for Node.js.
- **winston**: A logging library for Node.js.

## Scripts

This project includes the following scripts:

- **test**: Runs a basic test command (currently not implemented).
    ```bash
    npm test
    ```
    Output:
    ```bash
    Error: no test specified
    ```

## License

This project is licensed under the **ISC License**.

## Contributing

We welcome contributions to this project! To contribute, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes and commit (`git commit -am 'Add new feature'`).
4. Push to your branch (`git push origin feature/your-feature`).
5. Create a pull request.

## Author

- **Author**: John Kponyo Djama Kofi
- **Email**: john.kponyo@amalitech.com

---

# student-management--system-tests
