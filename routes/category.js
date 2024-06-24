const router = require('express').Router();
const categoryController = require('../controllers/categoryController');

router.post("/", categoryController.createCategory);
router.get("/", categoryController.getAllCategory);
router.get("/random", categoryController.getRandomCategory);
router.put("/:categoryId", categoryController.updateCategory); // Add this line to define the update route
router.put("/:categoryId/image", categoryController.updateCategoryImage);
module.exports = router;
