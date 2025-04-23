const express = require('express');

const db = require("./config/database.js");
const app = express();
const PORT = process.env.PORT || 3000;
const newsRoute = require('../src/routes/newsRoutes')
const eventRoute = require('../src/routes/eventRoutes')
const courseRoute = require('../src/routes/courseRoute')

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/api',newsRoute,eventRoute,courseRoute);


app.listen(PORT, () => {
    console.log(`Server is running on port : ${PORT}`);
});
