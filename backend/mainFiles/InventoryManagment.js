const models = require("../models");

async function findCurrentUser(req, res) {
  const userSession = req.cookies.session_id;
  const user = await models.User.findOne({ sessionIds: userSession });

  if (!user) {
    return res.status(400).json({ cause: "no session found" });
  }
  let organisedUser = {};
  const userName = user.name;
  organisedUser.name = userName;
  organisedUser.userType = user.userType;
  const userOrganisation = (await user.populate("organisation")).organisation;
  if (!userOrganisation) {
    organisedUser.organisation = null;
    return res.status(200).json({ user: organisedUser });
  }
  organisedUser.organisation = userOrganisation;
  const userAuthorization = user.userType;
  organisedUser.userType = userAuthorization;

  return res.status(200).json({ user: organisedUser });
}

async function getInventory(req,res) {
  const userSession = req.cookies.session_id;
  const user = await models.User.findOne({ sessionIds: userSession });
  if (!user) {
    return res.status(400).json({ cause: "no user session" });
  }
  if (user.userType === "unemployed") {
    return res.status(400).json({ cause: "you are unemployed" })
  }
  const userOrganisation = (await user.populate("Organisation")).organisation;
  const organisationInventory = (await userOrganisation.populate("Inventory"))
}

module.exports = { findCurrentUser };
