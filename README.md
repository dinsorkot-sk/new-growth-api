# New Growth API

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)]

A RESTful API for the New Growth platform built with Express.js, MySQL, and Sequelize (MVC architecture).  
Supports user authentication, file uploads, video streaming, and comes with Swagger documentation.

---

## Table of Contents

- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Project Structure](#project-structure)  
- [Getting Started](#getting-started)  
  - [Prerequisites](#prerequisites)  
  - [Installation](#installation)  
  - [Environment Variables](#environment-variables)  
  - [Database Setup](#database-setup)  
  - [Running the Application](#running-the-application)  
  - [Windows PowerShell Tasks](#windows-powershell-tasks)  
- [API Documentation](#api-documentation)  
- [Available Scripts](#available-scripts)  
- [Contributing](#contributing)  
- [License](#license)  

---

## Features

- User registration, login, JWT-based authentication  
- Role-based access: **admin** and **user**  
- CRUD operations for users  
- File upload/download (`/upload`)  
- Video streaming (`/video`)  
- Database migrations & seeders with Sequelize CLI  
- Swagger (OpenAPI) interactive docs  
- MVC directory structure  

---

## Tech Stack

- **Node.js** & **Express.js**  
- **MySQL** database  
- **Sequelize** ORM  
- **dotenv** for config  
- **nodemon** for development  
- **Swagger UI** for docs  

---

## Project Structure

```
express-api/
│── src/
│   ├── config/        # Database configurations
│   ├── controllers/   # Business logic
│   ├── models/        # Sequelize models
│   ├── routes/        # API routes
│   ├── migrations/    # Database migrations
│   ├── seeders/       # Seed data
│   ├── server.js      # Main server file
│── .env               # Environment variables
│── package.json       # Dependencies and scripts
│── README.md          # Project documentation
```

## 🛠 Setup and Installation
### 1️⃣ Clone the Repository
```sh
git clone https://github.com/dinsorkot-sk/new-growth-api.git
cd express-api
```

### 2️⃣ Install Dependencies
```sh
npm install
```

### 3️⃣ Configure Environment Variables
Create a `.env` file in the root directory:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=mydatabase
PORT=3000
```

### 4️⃣ Initialize Sequelize
```sh
npx sequelize-cli init --migrations-path src/migrations --models-path src/models --seeders-path src/seeders --config src/config/config.json
```

### 5️⃣ Create the Database
```sh
npx sequelize-cli db:create --config src/config/database.js
```

### 6️⃣ Create migrations
```sh
npx sequelize-cli migration:generate --name <migration_name> --migrations-path src/migration
```

### 7️⃣ Run Migrations
```sh
npx sequelize-cli db:migrate --config src/config/database.js
```

### 8️⃣ Start the Server
```sh
npm run dev
```

## 📡 API Endpoints
| Method | Endpoint       | Description         |
|--------|--------------|---------------------|
| GET    | `/`          | Welcome message    |
| GET    | `/users`     | Get all users      |
| POST   | `/users`     | Create a new user  |

## 📜 License
This project is licensed under the MIT License.

