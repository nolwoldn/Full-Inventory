const models = require("../models");

async function createOrganisation(req, res) {
  const { companyName } = req.body;

  if (!companyName) {
    return res.status(422).json({cause: "Company name not included"})
  }

  const userSession = req.cookies.session_id;
  const user = await models.User.findOne({ sessionIds: userSession });

  if (!user || !userSession) {
    return res.status(400).json({cause: "their is no user"})
  }
  if (user.Organisation) {
    return res.status(400).json({ cause: "user not allowed to have multiple bussiness" });
  }
  const exsistingOrgs = await models.Organisation.findOne({ name: companyName });
  if (exsistingOrgs) {
    return res.status(400).json({ cause: "Orginisation by that name already exists" });
  }
  const NewOrganisation = await models.Organisation.create({
    name: companyName,
    admin: user._id,
  });
  user.Organisation = NewOrganisation._id;
  user.userType = "admin";
  await user.save();
  return res.status(201).json({ succsess: true });
}

module.exports = { createOrganisation }
