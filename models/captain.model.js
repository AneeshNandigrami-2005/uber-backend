const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const captainSchema = new mongoose.Schema(
  {
    fullname: {
      firstname: {
        type: String,
        required: true,
        minlength: [3, "Firstname must be at least 3 characters long"],
      },

      lastname: {
        type: String,
        required: true,
        minlength: [3, "Lastname must be at least 3 characters long"],
      },
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    socketId: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },

    vehicle: {
      model: {
        type: String,
        required: true,
        minlength: [2, "Vehicle model must be at least 2 characters long"],
      },

      color: {
        type: String,
        required: true,
        minlength: [3, "Color must be at least 3 characters long"],
      },

      plate: {
        type: String,
        required: true,
        minlength: [3, "Plate must be at least 3 characters long"],
      },

      capacity: {
        type: Number,
        required: true,
        min: [1, "Capacity must be at least 1"],
      },

      photo: {
     type: String,
     default: ""
     },
      vehicleType: {
        type: String,
        required: true,
        enum: ["car", "bike", "motorcycle", "toto"],
      },
    },

    // total earnings for the captain (persisted)
    earned: {
      type: Number,
      default: 0,
    },

    location: {
      lat: {
        type: Number,
        default: 0,
      },

      lng: {
        type: Number,
        default: 0,
      },
    },
  },

  {
    timestamps: true,
  }
);

// Generate JWT Token
captainSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
};

// Compare Password
captainSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Hash Password
captainSchema.statics.hashPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};

// Create Model
const captainModel = mongoose.model("Captain", captainSchema);

// Export Model
module.exports = captainModel;