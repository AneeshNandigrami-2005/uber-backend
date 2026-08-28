const express = require("express");
const router = express.Router();

const { query } = require("express-validator");

const mapsController = require("../controllers/maps.controller");
const authMiddleware = require("../middlewares/auth.middleware");


// ===============================
// GET COORDINATES (Protected)
// ===============================
router.get(
    "/get-coordinates",
    query("address")
        .isString()
        .isLength({ min: 3 }),

    authMiddleware.authUser,

    mapsController.getCoordinates
);


// ===============================
// GET DISTANCE + TIME (Protected)
// ===============================
router.get(
    "/get-distance-time",
    query("origin")
        .isString()
        .isLength({ min: 3 }),

    query("destination")
        .isString()
        .isLength({ min: 3 }),

    authMiddleware.authUser,

    mapsController.getDistanceTime
);


// ===============================
// GET LOCATION SUGGESTIONS (Public)
// ===============================
router.get(
    "/get-suggestions",
    query("input")
        .isString()
        .isLength({ min: 3 }),

    mapsController.getAutoCompleteSuggestions
);


module.exports = router;