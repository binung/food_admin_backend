const router = require('express').Router();
const restaurantController = require('../controllers/restaurantController');
const { verifyAdmin, verifyVendor } = require('../middleware/verifyToken');

router.post("/", restaurantController.addRestaurant);
router.get("/search/:search", restaurantController.searchRestaurants);
router.get("/byId/:id", restaurantController.getRestaurantById);

router.delete("/byId/:id", restaurantController.deleteRestaurant);
router.get("/:code", restaurantController.getRandomRestaurant);
router.put("/status/:id", verifyAdmin, restaurantController.changeStatus);
router.get("/all/:code", restaurantController.getAllNearByRestaurant);
router.get("/", restaurantController.getRestaurants); // This route handles the fetching with query params
router.get('/profile/:userId',restaurantController.getRestaurantProfileByToken);
// New route to fetch restaurants by owner ID
router.get('/byOwner/:ownerId', restaurantController.getRestaurantsByOwnerId);
router.patch('/:restaurantId', restaurantController.toggleRestaurantStatus);
router.post("/reservations", restaurantController.reservationRestaurants);

router.get('/reservations/:restaurantId', restaurantController.getReservationsByRestaurantId);

router.put('/reservations/:reservationId/status',  restaurantController.updateReservationStatus);

router.get("/:id/food", restaurantController.getFoodByRestaurant);
router.get("/search/:search", restaurantController.searchRestaurants);
router.delete("/:id/food/:foodId", restaurantController.deleteFoodByRestaurant);
router.get('/reserv/:restaurantId',restaurantController.getResevationByStatus);
module.exports = router;
