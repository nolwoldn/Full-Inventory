const mongoose = require("mongoose");
const test = "hallo";

async function connect() {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    throw new Error("Mongo uri isn't defined in the env");
  }

  try {
    const connection = await mongoose.connect(mongoURI);

    console.log("Database connection succsessful");
  } catch (error) {
    console.log(`Error ${error}  happenned during connection attempt`);
    process.exit(1);
  }
};

module.exports = connect;