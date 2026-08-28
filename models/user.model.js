const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    fullname: {
      firstname: {
        type: String,
        required: true,
        minlength: 3,
      },
      lastname: {
        type: String,
        required: true,
        minlength: 3,
      },
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
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

    profileImage: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

//////////////////////////////
// 🔐 HASH PASSWORD
//////////////////////////////
userSchema.statics.hashPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};

//////////////////////////////
// 🔐 COMPARE PASSWORD
//////////////////////////////
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

//////////////////////////////
// 🔐 JWT TOKEN
//////////////////////////////
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
};

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;