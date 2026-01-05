const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const {
    registerUser,
    loginUser,
    getMe,
    forgotPassword,
    verifyOTP,
    resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post(
    '/register',
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check(
            'password',
            'Please enter a password with 6 or more characters'
        ).isLength({ min: 6 }),
    ],
    registerUser
);

router.post(
    '/login',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists(),
    ],
    loginUser
);

router.get('/me', protect, getMe);

router.post('/forgotpassword', forgotPassword);
router.post('/verifyotp', verifyOTP);
router.put('/resetpassword', resetPassword);

module.exports = router;
