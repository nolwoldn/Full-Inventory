const crypto = require("crypto");
const models = require("../models");

async function Login(req, res) {
  const { email, password, remeber } = req.body;
  if (!email || !password) {
    return res.status(400).json({ cause: "Inputs not filled in correctly" });
  }

  const hashedPassword = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");
  try {
    const userExists = await models.User.exists({
      email: email,
      password: hashedPassword,
    });
  } catch (e) {
    console.log(`Error ${e} happned during login`);
  }

  if (!userExists) {
    return res.status(400).json({ cause: "Email or password not correct" });
  }

  const sessionId = crypto.randomBytes(32).toString("base64url");

  req.session.userSessionId = sessionId;

  const cookieOptions = {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  };

  if (remeber) {
    cookieOptions.maxAge = 1000 * 60 * 60 * 24 * 30;
  }

  res.cookie("session_id", sessionId, cookieOptions).json({ succsess: true });
}
