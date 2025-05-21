const mysql = require("mysql2");
require("dotenv").config();

const env = process.env.NODE_ENV || 'development';

let dbConfig;

if (env === 'production') {
  dbConfig = {
    host: process.env.PROD_DB_HOST,
    user: process.env.PROD_DB_USERNAME,
    password: process.env.PROD_DB_PASSWORD,
    database: process.env.PROD_DB_NAME,
    port: process.env.PROD_DB_PORT,
  };
} else if (env === 'test') {
  dbConfig = {
    host: process.env.TEST_DB_HOST,
    user: process.env.TEST_DB_USERNAME,
    password: process.env.TEST_DB_PASSWORD,
    database: process.env.TEST_DB_NAME,
    port: process.env.TEST_DB_PORT,
  };
} else {
  // default: development
  dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  };
}

const db = mysql.createConnection(dbConfig);

module.exports = db;