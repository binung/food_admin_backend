const router = require('express').Router();
const userController = require('../controllers/userController')
const {verifyTokenAndAuthorization} = require('../middleware/verifyToken');

router.get("/verify/:otp",verifyTokenAndAuthorization, userController.verifyAccount);
router.get("/verify_phone/:phone",verifyTokenAndAuthorization, userController.verifyPhone);

router.get("/",verifyTokenAndAuthorization, userController.getUser);

router.get("/all-users", userController.getUsers);
router.put('/', verifyTokenAndAuthorization, userController.updateUser);
router.put("/updateToken/:token",verifyTokenAndAuthorization, userController.updateFcm);
router.post('/send-phone-otp', userController.sendPhoneVerificationOtp);
router.post('/verify-phone-otp', userController.verifyPhoneOtp);

module.exports = router;