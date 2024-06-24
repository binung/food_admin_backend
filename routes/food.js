const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');

router.post("/", foodController.addFoods);
router.get("/:id", foodController.foodById);
router.get("/recomendation/:code", foodController.getRandomFood);  
router.get("/search/:search", foodController.searchFood);
router.get("/:category/:code", foodController.getFoodByCategoryAndCode);
router.get('/:restaurantId', foodController.getFoodByRestaurant);


module.exports = router;



