const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
// Authentication middleware

router.post('/',  cartController.addProductToCart);
router.delete('/:id',  cartController.removeProductFromCart);
router.put('/increment/:id',  cartController.incrementProductQty);
router.put('/decrement/:id',  cartController.decrementProductQty);
router.get('/',  cartController.getCart);
router.get('/count',  cartController.getCartCount);

module.exports = router;
