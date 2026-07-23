// require is the commonJs import
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;
const connectToServer = require("./mainFiles/connectToDatabase.js"); //can import other files
const signUpFunctions = require("./mainFiles/signUp.js");

console.log(connectToServer());

const corsOptions = {
  origin: "http://localhost:5173",

  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

app.post("/api/verify/email", (request, response) => {
  signUpFunctions.verifyEmail(request, response);
});
app.post("/api/verify/code", (req, res) => {
  signUpFunctions.verifyOTP(req, res);
});
app.post("/api/signup/google", (req, res) => {
  signUpFunctions.googleSignup(req, res);
});
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
