const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token logic here
    if (token === 'invalid') {
        return res.status(403).json({ message: 'Forbidden: Invalid token' });
    }

    // Set user info on request object
    req.user = { id: 'user123', role: 'admin' };
    next();
};

module.exports = authMiddleware;