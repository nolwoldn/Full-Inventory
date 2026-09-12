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
  const userOrganisation = (await user.populate("Organisation")).Organisation;
  if (!userOrganisation) {
    organisedUser.organisation = null;
    return res.status(200).json({ user: organisedUser });
  }
  organisedUser.organisation = userOrganisation;
  const userAuthorization = user.userType;
  organisedUser.userType = userAuthorization;

  return res.status(200).json({ user: organisedUser });
}

async function getInventory(req, res) {
  const userSession = req.cookies.session_id;
  const user = await models.User.findOne({ sessionIds: userSession });
  if (!user) {
    return res.status(400).json({ cause: "no user session" });
  }
  if (user.userType === "unemployed") {
    return res.status(400).json({ cause: "you are unemployed" });
  }
  const userOrganisation = (await user.populate("Organisation")).Organisation;
  const organisationInventory = (await userOrganisation.populate("Inventory"))
    .Inventory;
  return res
    .status(200)
    .json({ success: true, inventory: organisationInventory });
}

async function AddInventoryItem(req, res) {
  const { name, amount, price, priceUnit, description } = req.body;
  if (!name || !amount  || !description) {
    return rew.status(422).json({ cause: "not all parts are filled" });
  }
  const newPrice = price ? price : undefined;
  const priceUnitNew = priceUnit;
  const userSession = req.cookies.session_id;
  const user = await models.User.findOne({ sessionIds: userSession });
  if (!user) {
    return res.status(400).json({ cause: "No user session" });
  }
  if (user.userType !== "admin") {
    return res
      .status(403)
      .json({ cause: "User is not authorized to make inventory items" });
  }
  const userOrganisation = (await user.populate("Organisation")).Organisation;

  const InventoryItem = await models.Inventory.create({
    name: name,
    Organisation: userOrganisation._id,
    personThatLastModified: user._id,
    lastModifiedTime: new Date(),
    amount,
    newPrice,
    priceUnitNew,
    description,
  });
  console.log(InventoryItem);
  userOrganisation.Inventory.push(InventoryItem._id);
  await userOrganisation.save();
  return res.status(201).json({ succsess: true });
}

module.exports = { findCurrentUser, getInventory, AddInventoryItem };
