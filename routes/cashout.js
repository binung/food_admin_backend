const router = require('express').Router();
const cashoutController = require('../controllers/cashoutController'); 
const {verifyAdmin} = require('../middleware/verifyToken')

router.post("/", cashoutController.requestCashout);

router.get("/", cashoutController.getCashouts);

router.put("/", cashoutController.changeCashoutStatus)

module.exports = router;