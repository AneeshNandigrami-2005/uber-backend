const captainModel = require('../models/captain.model');

module.exports.createCaptain = async (opts = {}) => {
    const {
        firstname,
        lastname,
        email,
        password,
        photo,
        color,
        plate,
        capacity,
        vehicleType,
        vehicle,
    } = opts;

    // Support either flat vehicle fields or a nested `vehicle` object
    const v = vehicle || {};
    const finalColor = color || v.color;
    const finalPlate = plate || v.plate;
    const finalCapacity = capacity || v.capacity;
    const finalVehicleType = vehicleType || v.vehicleType;
    const finalPhoto = photo || v.photo || "";

    if (!firstname || !lastname || !email || !password || !finalColor || !finalPlate || !finalCapacity || !finalVehicleType) {
        throw new Error('All fields are required');
    }

    const hashedPassword = await captainModel.hashPassword(password);

    const captain = await captainModel.create({
        fullname: {
            firstname,
            lastname,
        },
        email,
        password: hashedPassword,
        vehicle: {
            color: finalColor,
            plate: finalPlate,
            capacity: finalCapacity,
            photo: finalPhoto,
            vehicleType: finalVehicleType,
        },
        location: {
            lat: 0,
            lng: 0,
        },
    });

    return captain;
};