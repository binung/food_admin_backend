const router = require('express').Router();
const orderController = require('../controllers/orderController');
const {verifyTokenAndAuthorization} = require('../middleware/verifyToken');

router.post('/', verifyTokenAndAuthorization, orderController.placeOrder);
router.get('/getOrdersByRestaurant/:restaurantId', verifyTokenAndAuthorization, orderController.getOrdersByRestaurant);
router.get('/delivery/orders', orderController.getReadyOrders);
router.put('/:orderId/status',verifyTokenAndAuthorization, orderController.updateOrderStatus);
router.put('/picked-orders/:orderId/:driverId', orderController.pickOrder);
router.get('/orders/ready', orderController.driverOrder);
router.put('/delivered/:orderId', orderController.markOrderAsDelivered);
router.get('/:driverId/status/:orderStatus', orderController.getOrdersByDriverAndStatus);

module.exports = router;