const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const db = require("./config/database");
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger/swagger');
const serveIndex = require('serve-index');
const net = require('net');
const tls = require('tls');
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

// Enhanced Email Sending Endpoint
app.post('/send-email', (req, res) => {
    const { sender, recipient, subject, message } = req.body;
  
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!sender || !recipient || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: sender, recipient, subject, message' 
      });
    }
  
    // ตั้งค่า SMTP สำหรับ localhost
    const smtpHost = 'localhost';
    const smtpPort = 25; // พอร์ต SMTP มาตรฐาน
  
    const client = net.createConnection(smtpPort, smtpHost, () => {
      console.log('✅ Connected to local SMTP server');
    });
  
    let buffer = '';
  
    client.on('data', (chunk) => {
      buffer += chunk.toString();
      console.log('📨 SMTP:', buffer.trim());
  
      if (buffer.includes('220 ')) {
        client.write(`EHLO localhost\r\n`);
      } else if (buffer.includes('250 ')) {
        client.write(`MAIL FROM:<${sender}>\r\n`);
      } else if (buffer.includes('250 2.1.0')) {
        client.write(`RCPT TO:<${recipient}>\r\n`);
      } else if (buffer.includes('250 2.1.5')) {
        client.write(`DATA\r\n`);
      } else if (buffer.includes('354 ')) {
        const emailData = 
          `From: ${sender}\r\n` +
          `To: ${recipient}\r\n` +
          `Subject: ${subject}\r\n` +
          `\r\n${message}\r\n.\r\n`;
        client.write(emailData);
      } else if (buffer.includes('250 2.0.0')) {
        client.write('QUIT\r\n');
        res.json({ 
          success: true, 
          info: 'Email sent successfully!',
          details: {
            sender,
            recipient,
            subject
          }
        });
        client.end();
      }
    });
  
    client.on('error', (err) => {
      console.error('❌ SMTP error:', err);
      if (!res.headersSent) {
        res.status(500).json({ 
          success: false, 
          error: 'Mail delivery failed',
          details: err.message 
        });
      }
      client.end();
    });
  
    client.on('end', () => {
      console.log('📴 SMTP connection closed');
    });
  });

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