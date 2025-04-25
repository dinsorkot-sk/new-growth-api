const express = require('express');
const router = express.Router();
const adminController = require('../../controller/admin/adminController');

router.post('/', adminController.createAdmin);

router.post('/login',adminController.loginAdmin);

module.exports = router;