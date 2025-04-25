const authMiddleware = require('./auth');
const { requestLogger, responseTimeLogger, requestTimeTracker } = require('./logging');
const rateLimit = require('./rateLimiting');
const sanitizeBody = require('./sanitization');
const errorHandler = require('./errorHandler');

module.exports = {
    authMiddleware,
    requestLogger,
    responseTimeLogger,
    requestTimeTracker,
    rateLimit,
    sanitizeBody,
    errorHandler
};