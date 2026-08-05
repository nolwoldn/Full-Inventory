const models = require("../models");

async function findCurrentUser(req, res) {
  const userSession = req.cookies.session_id;
  const user = await models.User.findOne({ sessionIds: userSession });

  if (!user) {
    console.log("no user found")
    return res.status(400).json({ cause: "no session found" });
  }
  let organisedUser = {};
  const userName = user.name;
  organisedUser.name = userName;
  const userOrganisation = user.organisation;
  if (!userOrganisation) {
    organisedUser.organisation = null;
    organisedUser.userType = "unemployed";
    organisedUser.authorization = null;
    return res.status(200).json({ user: organisedUser });
  }
  organisedUser.organisation = userOrganisation;
  const userAuthorization = user.userType;
  organisedUser.userType = userAuthorization;
  console.log(organisedUser)
  return res.status(200).json({ user: organisedUser });
}

module.exports = { findCurrentUser };
