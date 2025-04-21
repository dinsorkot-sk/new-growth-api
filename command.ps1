# # 1. สร้างโฟลเดอร์โปรเจค
# mkdir my-express-project
# cd my-express-project

# 2. สร้างไฟล์ package.json
npm init -y

# 3. ติดตั้ง Express และ MySQL ORM (Sequelize)
npm install express mysql2 sequelize sequelize-cli dotenv

# 4. ติดตั้ง Nodemon และอื่น ๆ สำหรับ Dev
npm install --save-dev nodemon

# 5. สร้างโครงสร้าง MVC อย่างถูกต้อง
New-Item -ItemType Directory -Path "src"
New-Item -ItemType Directory -Path "src/config"
New-Item -ItemType Directory -Path "src/controllers"
New-Item -ItemType Directory -Path "src/models"
New-Item -ItemType Directory -Path "src/routes"
New-Item -ItemType Directory -Path "src/migrations"
New-Item -ItemType Directory -Path "src/seeders"

# 6. สร้างไฟล์หลัก
New-Item -Path "src/server.js" -ItemType "File"
New-Item -Path ".env" -ItemType "File"
New-Item -Path "src/config/database.js" -ItemType "File"

# 7. กำหนดค่า Sequelize CLI
npx sequelize-cli init

# 8. ย้ายโฟลเดอร์ที่ Sequelize CLI สร้างขึ้นให้ตรงกับ `src`
Move-Item -Path "models" -Destination "src/models" -Force
Move-Item -Path "migrations" -Destination "src/migrations" -Force
Move-Item -Path "seeders" -Destination "src/seeders" -Force
Move-Item -Path "config" -Destination "src/config" -Force

# 9. ตั้งค่า Sequelize ให้ใช้ `.env`
Set-Content -Path "src/config/database.js" -Value @"
require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'mysql'
  }
};
"@

# 10. ตั้งค่า `.env`
Set-Content -Path ".env" -Value @"
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=mydatabase
"@

# 11. ตั้งค่า `server.js`
Set-Content -Path "src/server.js" -Value @"
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port \${PORT}`);
});
"@

# 12. อัพเดต package.json ให้ใช้ nodemon
(Get-Content package.json) -replace '"test": "echo \\\"Error: no test specified\\\" && exit 1"', '"start": "node src/server.js", "dev": "nodemon src/server.js"' | Set-Content package.json
