// src/swagger/index.js
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'New Growth API',
      version: '1.0.0',
      description: 'API documentation for New Growth',
    },
  },
  apis: ['./src/routes/**/*.js'], // 👈 รวมทุกไฟล์ใน routes ทั้ง admin และ user
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
