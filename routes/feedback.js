const router = require('express').Router();
const feedController = require('../controllers/fedbackController');

router.get("/", feedController.getFeedback);


module.exports = router;
