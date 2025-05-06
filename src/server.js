const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const db = require("./config/database");
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger/swagger');
const serveIndex = require('serve-index');
const path = require('path');
require('dotenv').config();

// Import middleware
const {
    authMiddleware,
    requestLogger,
    responseTimeLogger,
    requestTimeTracker,
    rateLimit,
    sanitizeBody,
    errorHandler
} = require('./middleware');

// Import routes
const {
    event: userEvent,
    news: userNews,
    topic: userTopic,
    video: userVideo,
    document: userDocument,
    course: userCourse,
    review: userReview,
    image: userImage,
    answer: userAnswer
} = require('./routes/user')
const {
    event: adminEvent,
    admin: adminLogin,
    news: adminNews,
    topic: adminTopic,
    course: adminCourse,
    video: adminVideo,
    document: adminDocument,
    image: adminImage,
    review: adminReview,
    answer: adminAnswer
} = require('./routes/admin');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Built-in middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Custom middleware
app.use(requestLogger);
app.use(requestTimeTracker);
app.use(responseTimeLogger);
app.use(sanitizeBody);
app.use(rateLimit);

// Swagger documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/openapi.json', (req, res) => res.json(swaggerSpec));

// Basic route
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// CORS settings
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
});

// Static files serving
const uploadDir = path.join(__dirname, '../upload');
const videoDir = path.join(__dirname, '../video');
app.use('/upload', express.static(uploadDir), serveIndex(uploadDir, { icons: true }));
app.use('/video', express.static(videoDir), serveIndex(videoDir, { icons: true }));

// API Routes
app.use('/api/event', userEvent);
app.use('/api/news', userNews);
app.use('/api/topic', userTopic);
app.use('/api/video', userVideo);
app.use('/api/document', userDocument);
app.use('/api/course', userCourse)
app.use('/api/review', userReview)
app.use('/api/image', userImage)
app.use('/api/answer', userAnswer)
app.use('/api/admin/', adminLogin);

// Admin dashboard route
app.get('/api/admin/dashboard', authMiddleware, (req, res) => {
    res.json({ message: `ยินดีต้อนรับคุณ ${req.user.username}` });
});

// Admin protected routes
app.use('/api/admin/event', authMiddleware, adminEvent);
app.use('/api/admin/news', authMiddleware, adminNews);
app.use('/api/admin/topic', authMiddleware, adminTopic);
app.use('/api/admin/course', authMiddleware, adminCourse);
app.use('/api/admin/video', authMiddleware, adminVideo);
app.use('/api/admin/document', authMiddleware, adminDocument);
app.use('/api/admin/image', authMiddleware, adminImage);
app.use('/api/admin/review', authMiddleware, adminReview);
app.use('/api/admin/answer', authMiddleware, adminAnswer);


// Error handling middleware
app.use(errorHandler);

// Database connection
db.connect(err => {
    if (err) {
        console.error("❌ Database connection failed:", err);
    } else {
        console.log("✅ Connected to MySQL database");
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});