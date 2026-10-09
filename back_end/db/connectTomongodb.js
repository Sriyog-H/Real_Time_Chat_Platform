const mongoose = require("mongoose");

async function connectTomongoDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("connected to mongoDB");
  } catch (error) {
    console.log("connection error to mongoDB ", error.message);
  }
}

module.exports = connectTomongoDB;
