require("dotenv").config();
const nodeMailer = require("nodemailer");
const models = require("../models");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const letters = "abcdefghijklmnopqrstuvwxyz";
//mail delivery sys
const transporter = nodeMailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function txtRandom(length) {
  let choice = (list) => {
    const multiplier = list.length;
    const idx = Math.floor(Math.random() * multiplier);
    return { id: idx, choice: list[idx] };
  };
  let finalValue = "";

  for (let i = 0; i <= length; i++) {
    let choiceArrays = [
      choice([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]).choice,
      choice(letters.toUpperCase()).choice,
      choice(letters).choice,
    ];
    let lettersOrNumbers = choice([0, 1, 2]).choice;
    finalValue += choiceArrays[lettersOrNumbers];
  }

  return finalValue;
}

function deleteOTP(otpDatabase) {
  let deletionTimer = setTimeout(async () => {
    let delOTPDATABASE = await models.OTP.findByIdAndDelete(otpDatabase._id);
  }, 60000);
  return;
}

async function verifyEmail(request, response) {
  const { email } = request.body;
  let otp = { time: 60000, value: "" };

  if (!email) {
    return response.status(400).json({ cause: "user email not filled out" });
  }

  const exisistingUser = await models.User.findOne({ email });
  if (exisistingUser) {
    return response.status(400).json({ cause: "Email already exists" });
  }

  otp.value = txtRandom(5);

  const DatabaseOTP = await models.OTP.create({
    otp: otp.value,
  });
  deleteOTP(DatabaseOTP);

  try {
    const mailDesign = {
      from: `"Inventory Gen" <${process.env.EMAIL_PASS}>`,
      to: email,
      subject: "Verify Email",
      text: "We need to verify this is your email account",
      html: `
                <div style="
                display : flex ; 
                flex-flow :column nowrap; 
                width : 100% ; 
                margin-bottom : 50px; 
                padding : 20px;" 
                > 
                  <h1>Email Verification</h1>
                  <p style="font-size : 25px ; justify-self : center;  ">${otp.value}</p>

                  <p>
                  This otp is meant to prove that this is your account as someone has tried signing up on this gmail
                  if this was not you please check your email address else copy the random generated otp and paste it into the inputs at the sign up screen
                  this otp will be valid for 5 minutes
                  </p>
                </div>
            `,
    };
    const emailSent = await transporter.sendMail(mailDesign);
    return response.status(200).json({ succsess: true });
  } catch (e) {
    console.log("something happened while designing the mail to send");
    return response
      .status(400)
      .json({ cause: `Error ${e} happned while sendimg Email` });
    throw new Error(`Error ${e} happned during the signup`);
  }
}

const verifyOTP = async (req, res) => {
  const { email, password, otp } = req.body;

  if (!email || !otp || !password || !(otp.length === 6)) {
    return res.status(200).json({ cause: "User hasn't filled all inputs" });
  }

  const otpExists = await models.OTP.exists({ otp: otp });

  if (!otpExists) {
    return res
      .status(400)
      .json({ succsess: false, cause: "otp doesn't exist" });
  }

  const foundOTP = await models.OTP.findOne({ otp: otp });
  const deleteingOTP = await models.OTP.findOneAndDelete({ _id: foundOTP._id });

  const user = await models.User.create({
    email: email,
    password: password,
  });

  return res.status(201).json({ succsess: true });
};

const testPost = async (req, res) => {
  try {
    let { email } = req.body;
    console.log(email);
  } catch (er) {
    console.log(er);
  }

  res.status(200).json();
};

async function googleSignup(req, res) {
  const { token } = req.body;
  if (!token) {
    return res
      .status(400)
      .json({ cause: "User didn't enter in a proper ticket" });
  }
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email } = payload;
    const generatedPassword = txtRandom(12);

    const exisistingUser = await models.User.findOne({ email });
    if (exisistingUser) {
      return res.status(400).json({ cause: "Email already exists" });
    }

    const user = await models.User.create({
      email : email,
      password: generatedPassword,
    });
  } catch (e) {
    return res.status(400).json({ cause: `Error ${e} happened` });
  }

  return res.status(201).json();
}

module.exports = { verifyEmail, verifyOTP ,googleSignup };
