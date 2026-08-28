const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Must match mongoose.model("User", userSchema)
      required: true
    },

    pickup: {
      type: String,
      required: true,
      minlength: 3
    },

    destination: {
      type: String,
      required: true,
      minlength: 3
    },

    vehicleType: {
      type: String,
      enum: ['toto', 'car', 'bike'],
      required: true
    },

    distance: {
      type: Number,
      required: true,
      default: 0
    },

    fare: {
      type: Number,
      required: true,
      default: 0
    },

    status: {
      type: String,
      enum: [
        'pending',
        'accepted',
        'ongoing',
        'completed',
        'cancelled'
      ],
      default: 'pending'
    },

    otp: {
      type: String,
      required: true,
      select: false
    },

    captain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Captain',
      default: null
    }
  },
  {
    timestamps: true
  }
);

const Ride = mongoose.model('Ride', rideSchema);

module.exports = Ride;