// src/routes/admin/index.js
const newsRoute = require('./newsRoutes');
const eventRoute = require('./eventRoutes');
const courseRoute = require('./courseRoute');

module.exports = {
    newsRoute,
    eventRoute,
    courseRoute
};