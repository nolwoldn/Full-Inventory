require("dotenv").config();
const nodeMailer = require("nodemailer");
const models = require("../models");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function clearSessionId(crrUser, SessionToRemove, time) {
  let timer = setTimeout(async () => {
    crrUser.sessionIds = crrUser.sessionIds.filter(
      (item) => item !== SessionToRemove,
    );
    await crrUser.save();
  }, time);
}

async function Login(req, res) {
  const { email, password, remeber } = req.body;
  if (!email || !password) {
    return res.status(400).json({ cause: "Inputs not filled in correctly" });
  }

  const hashedPassword = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");
  const crrUser = await models.User.findOne({
    name: email,
    password: hashedPassword,
  });

  if (!crrUser) {
    return res.status(400).json({ cause: "Email or password not correct" });
  }

  const sessionId = crypto.randomBytes(32).toString("base64url");


  const cookieOptions = {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  };
  const userSessionList = crrUser.sessionIds;
  crrUser.sessionIds = [...userSessionList, sessionId];
  crrUser.save();
  if (remeber) {
    cookieOptions.maxAge = 1000 * 60 * 60 * 24 * 30;
    clearSessionId(crrUser, sessionId, 1000 * 60 * 60 * 24 * 30);
  }

  if (!remeber) {
    clearSessionId(crrUser, sessionId, 1000 * 60 * 60 * 24);
  }

  res.cookie("session_id", sessionId, cookieOptions).json({ succsess: true });
}

async function googleLogin(req, res) {
  const { token, remeber } = req.body;
  if (!token) {
    return res.status(400).json({ cause: "No token" });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email } = payload;
    const exisistingUser = await models.User.findOne({ name: email });
    if (!exisistingUser) {
      return res.status(400).json({ cause: "Account doesn't exist" });
    }
    const sessionId = crypto.randomBytes(32).toString("base64url");

    req.session.userSessionId = sessionId;
    const crrUser = await models.User.findOne({ name: email });
    const crrUserSessions = crrUser.sessionIds;

    const cookieOptions = {
      httpOnly: false,
      secure: false,
      sameSite: "lax",
    };
    crrUser.sessionIds = [...crrUserSessions, sessionId];
    crrUser.save();
    if (remeber) {
      cookieOptions.maxAge = 1000 * 60 * 60 * 24 * 30;
      clearSessionId(crrUser, sessionId, 1000 * 60 * 60 * 24 * 30);
    }
    if (!remeber) {
      clearSessionId(crrUser, sessionId, 1000 * 60 * 60 * 24);
    }

    return res
      .cookie("session_id", sessionId, cookieOptions )
      .json({ succsess: true });
  } catch (e) {
    return res
      .status(400)
      .json({ cause: `Error ${e} during google Login , session id =` });
  }
}

module.exports = { Login, googleLogin };
