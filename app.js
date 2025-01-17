//Imports
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const dotenv = require('dotenv')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoose = require('mongoose')
const logger = require('./logger')
const setupSwagger = require('./swagger');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//MongoDB connect
const connect = mongoose.connect(process.env.DB_URI);

connect.then(() => {
    logger.info("Database connected successfully!")
})
.catch(() => {
    logger.error("Error connecting to DB")
})

//Logging all incoming requests
app.use((req, res, next) => {
    logger.info(`Incoming request: ${req.method} ${req.url}`);
    next();
  });

  // Rate Limiter
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later.',
});

app.use(limiter);

//Swagger
setupSwagger(app);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/enrollments', require('./routes/enrollmentRoutes'));
app.use('/api/sort/', require('./routes/sortRoutes'))

//404
app.use((req, res) => {
    logger.error(`Endpoint not found!`);
    res.status(404).json({ Error: 404, Message: 'Endpoint not found!' });
})

// Start server
// const server = app.listen(PORT, () => {
//     console.log(`Server spinning on [http://localhost:${PORT}]`);
// });

const server = app;

module.exports = { app, server }

