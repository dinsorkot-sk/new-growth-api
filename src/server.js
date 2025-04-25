const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const db = require("./config/database");

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
const { courseRoute } = require('./routes');
const { event: adminEvent, admin: adminLogin , news: adminNews,} = require('./routes/admin');

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

// Routes
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// API Routes
app.use('/api/courses', courseRoute);

// Admin Routes - with auth middleware
app.use('/api/admin/', adminLogin);

app.get('/api/admin/dashboard', authMiddleware, (req, res) => {
    res.json({ message: `ยินดีต้อนรับคุณ ${req.user.username}` });
});

app.use('/api/admin/event', authMiddleware, adminEvent);
app.use('/api/admin/news', authMiddleware, adminNews);

// Error handling middleware (should be last)
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