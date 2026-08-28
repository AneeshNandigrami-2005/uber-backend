const rideService = require('../Services/ride.service');
const mapService = require('../Services/maps.service');
const Ride = require('../models/ride.model');
const captainModel = require('../models/captain.model');
const userModel = require('../models/user.model');

const { validationResult } = require('express-validator');
const { sendMessageToSocketId } = require('../socket');


// =========================
// GET FARE
// =========================
const getFare = async (req, res) => {
    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { pickup, destination } = req.body;

        const fareData = await rideService.getFare({ pickup, destination });

        const pickupCoordinates =
            await mapService.getAddressCoordinate(pickup);

        const captainsInRadius =
            await mapService.getCaptainsInTheRadius(
                pickupCoordinates.lng,
                pickupCoordinates.lat,
                5
            );

        return res.status(200).json({
            fare: fareData.fare,
            distance: fareData.distance,
            nearbyCaptains: captainsInRadius.length
        });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};


// =========================
// CREATE RIDE
// =========================
const createRide = async (req, res) => {
    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { pickup, destination, vehicleType } = req.body;

        const normalizedVehicleType = (vehicleType || '').toLowerCase();
        const userId = req.user._id;

        const fareData = await rideService.getFare({ pickup, destination });

        let selectedFare = 0;

        switch (normalizedVehicleType) {
            case 'toto':
                selectedFare = fareData.fare.toto;
                break;
            case 'bike':
                selectedFare = fareData.fare.bike;
                break;
            case 'car':
                selectedFare = fareData.fare.car;
                break;
            default:
                return res.status(400).json({ message: 'Invalid vehicle type' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const ride = await Ride.create({
            user: userId,
            pickup,
            destination,
            vehicleType: normalizedVehicleType,
            distance: fareData.distance,
            fare: selectedFare,
            status: 'pending',
            otp
        });

        const rideWithUser = await Ride.findById(ride._id)
            .populate('user', 'fullname email socketId');

        rideWithUser.otp = "";

        const pickupCoordinates =
            await mapService.getAddressCoordinate(pickup);

        const captainsInRadius =
            await mapService.getCaptainsInTheRadius(
                pickupCoordinates.lng,
                pickupCoordinates.lat,
                5
            );

        const connectedCaptains = await captainModel.find({
            socketId: { $ne: null },
        });

        const targetCaptains =
            captainsInRadius.filter(c => c.socketId).length > 0
                ? captainsInRadius.filter(c => c.socketId)
                : connectedCaptains;

        for (const captain of targetCaptains) {

            if (!captain.socketId) continue;

            sendMessageToSocketId(captain.socketId, {
                event: 'new-ride',
                data: {
                    ride: rideWithUser,
                    captain: null // optional
                }
            });
        }

        const createdRide = await Ride.findById(ride._id)
            .select('+otp')
            .populate('user', 'fullname email');

        return res.status(201).json({
            message: 'Ride created successfully',
            ride: createdRide
        });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};


// =========================
// ACCEPT RIDE (CAPTAIN)
// =========================
const acceptRide = async (req, res) => {
    try {

        const { rideId } = req.body;

        if (!rideId) {
            return res.status(400).json({ message: 'rideId is required' });
        }

        const ride = await Ride.findById(rideId);

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        if (ride.status !== 'pending') {
            return res.status(400).json({ message: 'Ride not available' });
        }

        ride.status = 'accepted';
        ride.captain = req.captain._id;
        await ride.save();

        const populatedRide = await Ride.findById(ride._id)
            .select('+otp')
            .populate('user', 'fullname email socketId')
            .populate('captain', 'fullname profileImage vehicle socketId');

        const user = await userModel.findById(ride.user);

        // 🔥 NORMALIZED CAPTAIN OBJECT (IMPORTANT FIX)
        const captainPayload = {
            _id: req.captain._id,
            fullname: req.captain.fullname,
            profileImage: req.captain.profileImage,
            vehicle: req.captain.vehicle,
            location: req.captain.location,
            vehicleNumber: req.captain.vehicle?.plate || req.captain.vehicleNumber || req.captain.vehicleNo,
        };

        if (user?.socketId) {
            sendMessageToSocketId(user.socketId, {
                event: 'ride-accepted',
                data: {
                    ride: populatedRide,
                    captain: captainPayload
                }
            });
        }

        return res.status(200).json({
            message: 'Ride accepted',
            ride: populatedRide
        });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};


// =========================
// CONFIRM OTP
// =========================
const confirmOTP = async (req, res) => {
    try {

        const { rideId, otp } = req.body;

        const ride = await Ride.findById(rideId).select('+otp');

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        if (!ride.otp || ride.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        ride.status = 'ongoing';
        await ride.save();

        const populatedRide = await Ride.findById(ride._id)
            .populate('user', 'fullname email socketId')
            .populate('captain', 'fullname profileImage vehicle');

        const user = await userModel.findById(ride.user);
        const captain = await captainModel.findById(ride.captain);

        const payload = {
            event: 'ride-started',
            data: {
                ride: populatedRide
            }
        };

        if (user?.socketId) {
            sendMessageToSocketId(user.socketId, payload);
        }

        if (captain?.socketId) {
            sendMessageToSocketId(captain.socketId, payload);
        }

        return res.status(200).json({
            message: 'Ride started',
            ride: populatedRide
        });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getFare,
    createRide,
    acceptRide,
    confirmOTP,
};