  const express = require("express");
  const router = express.Router();

  const { body } = require("express-validator");

  const rideController = require("../controllers/ride.controller");
  const authMiddleware = require("../middlewares/auth.middleware");

  // =========================
  // CREATE RIDE (Protected)
  // =========================
  router.post(
    "/create",

    authMiddleware.authUser,

    body("pickup")
      .isString()
      .isLength({ min: 4 })
      .withMessage("Invalid pickup address"),

    body("destination")
      .isString()
      .isLength({ min: 4 })
      .withMessage("Invalid destination"),

    body("vehicleType")
      .isString()
      .isIn(["toto", "car", "bike"])
      .withMessage("Invalid vehicle type"),

    rideController.createRide
  );

  // =========================
  // ACCEPT RIDE (Captain)
  // =========================
  router.post(
    "/accept",

    authMiddleware.authCaptain,

    body("rideId").isMongoId().withMessage("Invalid rideId"),

    rideController.acceptRide
  );

  // =========================
  // GET FARE (TEMP: no auth)
  // =========================
  router.post(
    "/get-fare",

    // authMiddleware.authUser,   <-- removed for testing

    body("pickup")
      .isString()
      .isLength({ min: 4 })
      .withMessage("Invalid pickup address"),

    body("destination")
      .isString()
      .isLength({ min: 4 })
      .withMessage("Invalid destination"),

    rideController.getFare
  );

  // =========================
  // CONFIRM OTP (Captain)
  // =========================
  router.post(
    "/confirm-otp",

    authMiddleware.authCaptain,

    body("rideId").isMongoId().withMessage("Invalid rideId"),
    body("otp").isString().withMessage("Invalid OTP"),

    rideController.confirmOTP
  );

  module.exports = router;