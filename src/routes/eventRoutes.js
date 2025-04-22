const express = require('express');
const router = express.Router();
const eventController = require('../controller/eventController');
const upload = require('../config/multer'); 
const { route } = require('./newsRoutes');

//โพส event 
router.post('/event',upload.single('image'),eventController.createEvent)

router.get('/event',eventController.getAllEvents)

router.get('/event/:id',eventController.getEventById)

router.put('/event/:id',upload.single('image'),eventController.updateEvent)

router.delete('/event/:id',eventController.deleteEvent)


module.exports = router;