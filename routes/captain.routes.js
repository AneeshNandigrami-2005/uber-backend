const express = require('express');

const router = express.Router();

const { body } = require('express-validator');

const captainController =
    require('../controllers/captainController');

const authMiddleware =
    require('../middlewares/auth.middleware');

const upload =
    require('../middlewares/uploadCaptainPhoto');


// =========================
// REGISTER CAPTAIN
// =========================
router.post(

    '/register',

    // PHOTO UPLOAD
    upload.single("photo"),

    // VALIDATIONS
    [
        body('email')
            .isEmail()
            .withMessage("Invalid Email"),

        body('password')
            .isLength({ min: 6 })
            .withMessage(
                'Password must be at least 6 characters'
            )
    ],

    captainController.registerCaptain
);


// =========================
// LOGIN CAPTAIN
// =========================
router.post(

    '/login',

    [
        body('email')
            .isEmail()
            .withMessage('Invalid Email'),

        body('password')
            .isLength({ min: 6 })
            .withMessage(
                "Password must be 6 characters long"
            )
    ],

    captainController.loginCaptain
);


// =========================
// GET PROFILE
// =========================
router.get(

    '/profile',

    authMiddleware.authCaptain,

    captainController.getCaptainProfile
);


// =========================
// LOGOUT
// =========================
router.get(

    '/logout',

    authMiddleware.authCaptain,

    captainController.logoutCaptain
);


module.exports = router;