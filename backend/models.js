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
  Organisation: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: "Organisation",
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

const Organisation = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  workers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: false,
    }
  ],
  Inventory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      required: false,
    }
  ]
});

const Inventory = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  organisation: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Organisation",
  },
  description: {
    type: String,
    required: false,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  price: {
    type: Number,
    required: false,
    min: 1,
  },
  priceUnit: {
    type: String,
    required: false,
  }
})


module.exports = {
  User: mongoose.model("User", userSchema),
  OTP: mongoose.model("OTP", OtpSchema),
  Organisation: mongoose.model("Organisation", Organisation),
  Inventory: mongoose.model("Inventory", Inventory),
};
