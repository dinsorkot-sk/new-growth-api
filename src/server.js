const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const db = require("./config/database");
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger/swagger');
const serveIndex = require('serve-index');
const net = require('net');

const path = require('path');

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

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/openapi.json', (req, res) => res.json(swaggerSpec));

// Routes
app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
});

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

app.get('/api/admin/dashboard', authMiddleware, (req, res) => {
    res.json({ message: `ยินดีต้อนรับคุณ ${req.user.username}` });
});

app.use('/api/admin/event', authMiddleware, adminEvent);
app.use('/api/admin/news', authMiddleware, adminNews);
app.use('/api/admin/topic', authMiddleware, adminTopic);
app.use('/api/admin/course', authMiddleware, adminCourse);
app.use('/api/admin/video', authMiddleware, adminVideo);
app.use('/api/admin/document', authMiddleware, adminDocument);
app.use('/api/admin/image', authMiddleware, adminImage);
app.use('/api/admin/review', authMiddleware, adminReview);
app.use('/api/admin/answer', authMiddleware, adminAnswer);


app.post('/send-email', async (req, res) => {
    const { recipient, subject, message } = req.body;

    const smtpHost = "smtp.yourdomain.com"; // เปลี่ยนตามของคุณ
    const smtpPort = 25; // หรือ 587 / 465 แล้วแต่ server
    const username = "your-username";
    const password = "your-password";
    const sender = "you@yourdomain.com";

    const client = net.createConnection(smtpPort, smtpHost, () => {
        console.log("✅ Connected to SMTP server");
    });

    let buffer = "";

    client.on('data', (data) => {
        buffer += data.toString();
        console.log("📨 SMTP:", buffer);

        if (buffer.includes("220")) {
            client.write(`EHLO localhost\r\n`);
        } else if (buffer.includes("250") && !buffer.includes("AUTH")) {
            client.write(`AUTH LOGIN\r\n`);
        } else if (buffer.includes("334")) {
            if (buffer.includes("VXNlcm5hbWU6")) {
                client.write(Buffer.from(username).toString('base64') + `\r\n`);
            } else if (buffer.includes("UGFzc3dvcmQ6")) {
                client.write(Buffer.from(password).toString('base64') + `\r\n`);
            }
        } else if (buffer.includes("235")) {
            client.write(`MAIL FROM:<${sender}>\r\n`);
        } else if (buffer.includes("250 2.1.0")) {
            client.write(`RCPT TO:<${recipient}>\r\n`);
        } else if (buffer.includes("250 2.1.5")) {
            client.write(`DATA\r\n`);
        } else if (buffer.includes("354")) {
            const emailBody =
                `From: ${sender}\r\nTo: ${recipient}\r\nSubject: ${subject}\r\n\r\n${message}\r\n.\r\n`;
            client.write(emailBody);
        } else if (buffer.includes("250 2.0.0")) {
            client.write(`QUIT\r\n`);
            res.status(200).json({ success: true, message: "Email sent successfully" });
            client.end();
        }
        // reset buffer for next step
        buffer = '';
    });

    client.on('error', (err) => {
        console.error("❌ SMTP error:", err);
        res.status(500).json({ success: false, error: err.message });
    });

    client.on('end', () => {
        console.log("📴 SMTP connection closed");
    });
});


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