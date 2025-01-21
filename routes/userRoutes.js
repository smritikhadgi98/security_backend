const router = require('express').Router();
const userController = require('../controllers/userControllers');
const { authGuard, adminGuard } = require('../middleware/authGuard');


// Creating user registration route
router.post('/create', userController.createUser);

// Creating user login route
router.post('/login', userController.verifyRecaptcha, userController.loginUser);

// Route to generate token
router.post('/token', userController.getToken);

// Route to get current user
router.get('/current', userController.getCurrentUser);

router.post('/forgot_password', userController.forgotPassword);

router.post('/verify_otp', userController.verifyOtpAndResetPassword)

// upload profile picture
router.post('/profile_picture', userController.uploadProfilePicture);

// update user details
router.put('/update', authGuard, userController.editUserProfile);

//verify login otp
router.post('/verify_login_otp',userController.loginOtp)

router.post('/resend_login_otp',userController.resendLoginOtp)

router.post('/verify_register_otp',userController.verifyRegisterOtp)





// Exporting the router
module.exports = router;
