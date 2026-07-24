// require is the commonJs import
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 5000;
const connectToServer = require("./mainFiles/connectToDatabase.js"); //can import other files
const signUpFunctions = require("./mainFiles/signUp.js");
const models = require("./models.js");

console.log(connectToServer());

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
  optionsSuccessStatus: 200,
};
const excludedPaths = ["/api/csrf-token"];

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
  if (excludedPaths.includes(req.path)) {
    return next();
  }

  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  const cookieToken = req.cookies.csrf_token;
  const sessionToken = req.session ? req.session.csrf_token : null;

  if (!cookieToken || !sessionToken) {
    return res.status(403).json({ cause: "csrf_token missing" });
  }

  const buf1 = Buffer.from(cookieToken);
  const buf2 = Buffer.from(sessionToken);

  if (buf1.length === buf2.length && crypto.timingSafeEqual(buf1, buf2)) {
  }
});
app.use(
  session({
    secret: "",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, sameSite: "lax" },
  }),
);

app.post("/api/verify/email", (request, response) => {
  signUpFunctions.verifyEmail(request, response);
});
app.post("/api/verify/code", (req, res) => {
  signUpFunctions.verifyOTP(req, res);
});
app.post("/api/signup/google", (req, res) => {
  signUpFunctions.googleSignup(req, res);
});
app.get("/api/csrf-token", (req, res) => {
  if (req.session && req.session.csrf_token) {
    return req.session.csrf_token;
  }

  const newToken = generateCsrfToken();
  req.session.csrf_token = newToken;
  res
    .cookie("csrf_token", newToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    })
    .json({ succsess: true });

  return newToken;
});
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});

function generateCsrfToken() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";

  let token = "";
  const bytes = crypto.randomBytes(32);
  for (let i = 0; i < 32; i++) {
    token += chars[bytes[i] % chars.length];
  }
  return token;
}
