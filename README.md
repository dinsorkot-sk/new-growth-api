# Express.js API with MySQL and Sequelize

## 📌 Overview
This project is a RESTful API built with **Express.js**, connected to a **MySQL** database using **Sequelize ORM**. It follows the **MVC (Model-View-Controller)** pattern and supports **database migrations**.

## 🚀 Features
- Express.js for building the API
- Sequelize ORM for database management
- MySQL as the database
- Environment variables with dotenv
- Database migrations and seeders
- MVC architecture

## 🏗 Project Structure
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
git clone https://github.com/dinsorkot-sk/express-api.git
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

