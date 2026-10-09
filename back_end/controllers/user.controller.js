const User = require("../model/user.model");

async function getUserForSidebar(req, res) {
  try {
    const loggedInUserId = req.user._id;

    const filteredUser = await User.find({ _id: { $ne: loggedInUserId } }).select("-password"); // logged in user ko hta ke sare

    return res.status(200).json(filteredUser);
  } catch (error) {
    console.error("error in user controller : ", error.message);
    return res.status(500).json({ error: "internal server error" });
  }
}

module.exports = getUserForSidebar;
