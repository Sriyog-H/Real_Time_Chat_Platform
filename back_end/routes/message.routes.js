const express = require("express");
const router = express.Router();
const protectRoute = require("../middleware/protectRoute");
const { messageLimiter } = require("../middleware/rateLimiter");

const {
  sendMessage,
  receiveMessage,
  reactToMessage,
} = require("../controllers/message.controller");

router.get("/:id", protectRoute, receiveMessage);
router.post("/send/:id", protectRoute, messageLimiter, sendMessage);
router.post("/:messageId/reaction", protectRoute, reactToMessage);

module.exports = router;
