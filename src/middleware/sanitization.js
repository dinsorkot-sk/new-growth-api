const sanitizeBody = (req, res, next) => {
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                // Remove HTML tags
                req.body[key] = req.body[key].replace(/<[^>]*>?/gm, '');
            }
        });
    }
    next();
};

module.exports = sanitizeBody;