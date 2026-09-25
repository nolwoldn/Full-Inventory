const models = require("../models");

async function manageInventory(req, res) {
  const sentData = req.body;
  const possibleFunctions = ["Create", "Update", "Delete"];
  if (!sentData || !sentData.functionList) {
    return res.status(400).json({ cause: "Data not provided" });
  }
}

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
  organisedUser.organisation = userOrganisation.name;
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
  if (user.userType !== "admin") {
    organisationInventory.personThatLastModified = "Unavailable";
    organisationInventory.lastModifiedTime = "Unavailable";
  }
  return res
    .status(200)
    .json({ success: true, inventory: organisationInventory });
}

async function AddInventoryItem(req, res) {
  const { name, amount, price, priceUnit, description } = req.body;
  if (!name || !amount || !description) {
    return rew.status(422).json({ cause: "not all parts are filled" });
  }
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
  const userOrg = (await user.populate("Organisation")).Organisation;
  let orgInventoryItems = (await userOrg.populate("Inventory")).Inventory;
  const ItemExists = orgInventoryItems.some((item) => item.name === name);
  if (ItemExists) {
    return res.status(400).json({
      cause: "You cannot have have two inventory items with the same name",
    });
  }
  let organisedItem = {
    name: name,
    Organisation: userOrg._id,
    personThatLastModified: user._id,
    amount: amount,
    description: description,
  };

  price ? (organisedItem.price = price) : null;
  priceUnit ? (organisedItem.priceUnit = priceUnit) : null;

  const InventoryItem = await models.Inventory.create(organisedItem);
  userOrg.Inventory.push(InventoryItem._id);
  await userOrg.save();
  return res.status(201).json({ succsess: true });
}

async function updateItem(req, res) {
  const { list } = req.body;
  if (!list) {
    return res.status(400).json({ cause: "Data not fufilled" });
  }
  const userSession = req.cookies.session_id;
  const user = await models.User.findOne({ sessionIds: userSession });
  if (!user) {
    return res.status(400).json({ cause: "No user session" });
  }
  if (user.userType === "unemployed") {
    return res
      .status(403)
      .json({ cause: "User is not authorized to make inventory items" });
  }
  const userOrg = (await user.populate("Organisation")).Organisation;
  let orgInventoryItems = (await userOrg.populate("Inventory")).Inventory;
  const protectedAction = list.some((item) => {
    return (
      item.update.name ||
      item.update.price ||
      item.update.priceUnit ||
      item.update.description
    );
  });

  if (protectedAction && user.userType !== "admin") {
    return res
      .status(403)
      .json({ cause: "Not authorized to change that part" });
  }
  try {
    list.forEach(async (item) => {
      let orgItem = orgInventoryItems[item.InventoryIdx];
      if (!orgItem) {
        return res.status(400).json({ cause: "Item out of index" });
      }
      Object.assign(orgItem, item.update);
      await orgItem.save();
    });
  } catch (Er) {
    console.log(Er);
    return res
      .status(400)
      .json({ cause: `Error ${Er} happened in the backend` });
  }
  return res.status(201).json({ success: true });
}

async function deleteItems(req, res) {
  const { index } = req.body;
  if (index === undefined || index === null ) {
    return res.status(422).json({ cause: "not all parts are filled" , index});
  }
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
  const userOrg = (await user.populate("Organisation")).Organisation;
  let orgInventoryItems = (await userOrg.populate("Inventory")).Inventory;
  const ItemExists = orgInventoryItems[index];
  if (!ItemExists) {
    return res.status(400).json({ success: "Item not found" });
  }
  await models.OTP.findOneAndDelete(ItemExists._id)
  return res.status(203).json({ success: true });
}

module.exports = {
  findCurrentUser,
  getInventory,
  updateItem,
  AddInventoryItem,
  deleteItems,
};
