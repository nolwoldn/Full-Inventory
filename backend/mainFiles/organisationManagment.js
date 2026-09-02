const models = require("../models");

async function createOrganisation(req, res) {
  const userSession = req.cookies.session_id;
  const user = await models.User.findOne({ sessionIds: userSession });

  if (!user || !userSession) {
    return res.status(400).json({cause: "their is no user"})
  }
}
