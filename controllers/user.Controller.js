const userModel = require('../models/user.model');
const blackListTokenModel = require('../models/blacklistToken.model');

const { validationResult } = require('express-validator');


// REGISTER
module.exports.registerUser = async (req, res, next) => {

    try {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: errors.array()
            });
        }

        const { fullname, email, password } = req.body;
        const normalizedEmail = email.trim().toLowerCase();

        const isUserAlready = await userModel.findOne({ email: normalizedEmail });

        if (isUserAlready) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedpassword = await userModel.hashPassword(password);

        const user = await userModel.create({
            fullname: {
                firstname: fullname.firstname,
                lastname: fullname.lastname
            },
            email: normalizedEmail,
            password: hashedpassword
        });

        const freshUser = await userModel.findById(user._id);

        const token = freshUser.generateAuthToken();

        res.status(201).json({
            token,
            user: freshUser
        });

    } catch (err) {

        console.log("REGISTER ERROR:", err);

        res.status(500).json({
            error: err.message
        });

    }

};


// LOGIN
module.exports.loginUser = async (req, res, next) => {

    try {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: errors.array()
            });
        }

        const { email, password } = req.body;
        const normalizedEmail = email.trim().toLowerCase();

        const user = await userModel
            .findOne({ email: normalizedEmail })
            .select('+password');

        if (!user) {
            return res.status(401).json({
                message: 'Invalid Email or Password'
            });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                message: 'Invalid Email or Password'
            });
        }

        const token = user.generateAuthToken();

        res.cookie('token', token);

        res.status(200).json({
            token,
            user
        });

    } catch (err) {

        console.log("LOGIN ERROR:", err);

        res.status(500).json({
            error: err.message
        });

    }

};


// PROFILE
module.exports.getUserProfile = async (req, res, next) => {

    res.status(200).json(req.user);

};


// LOGOUT
module.exports.logoutUser = async (req, res, next) => {

    const token =
        req.cookies?.token ||
        req.headers.authorization?.split(' ')[1];

    await blackListTokenModel.create({ token });

    res.clearCookie('token');

    res.status(200).json({
        message: 'Logged Out'
    });

};

// UPLOAD PROFILE IMAGE
module.exports.uploadProfileImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: 'No image file uploaded'
            });
        }

        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                message: 'Unauthorized'
            });
        }

        const profileImage = req.file.path;

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { profileImage },
            { new: true }
        ).select('-password');

        res.status(200).json({
            message: 'Profile image uploaded successfully',
            user: updatedUser
        });
    } catch (err) {
        console.log('UPLOAD PROFILE IMAGE ERROR:', err);

        res.status(500).json({
            error: err.message
        });
    }
};