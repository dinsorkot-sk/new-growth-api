const requestLogger = (req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
};

const responseTimeLogger = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`Request to ${req.originalUrl} took ${duration}ms`);
    });

    next();
};

const requestTimeTracker = (req, res, next) => {
    req.requestTime = Date.now();
    next();
};

module.exports = {
    requestLogger,
    responseTimeLogger,
    requestTimeTracker
};