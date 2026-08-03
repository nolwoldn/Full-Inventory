const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  sessionIds: {
    type: Array,
    required: true,
  },
  organisation: {
    type: String,
    required: true,
  },
  userType: {
    type: String,
    requrired: true,
  },
});

const OtpSchema = new mongoose.Schema({
  otp: {
    type: String,
    required: true,
  },
});

module.exports = {
  User: mongoose.model("User", userSchema),
  OTP: mongoose.model("OTP", OtpSchema),
};
