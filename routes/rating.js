const router = require('express').Router();
const ratingController = require('../controllers/ratingController');

router.get('/', ratingController.getRating);
router.post('/', ratingController.addRating);
module.exports = router;