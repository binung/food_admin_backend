const router = require('express').Router();
const driversController = require('../controllers/driversControllers');
const { verifyAdmin, verifyTokenAndAuthorization,verifyDriver} = require('../middleware/verifyToken');

router.post('/createDriver', driversController.createDriver);
router.get('/driverProfile/:userId', driversController.getDriverProfileByToken);
router.put("/",verifyAdmin, driversController.updateDriverStatus);
router.get("/orders/picked/Delivered/",verifyAdmin, driversController.getDriverOrders);
router.get('/', verifyTokenAndAuthorization, driversController.getDrivers);
module.exports = router;
