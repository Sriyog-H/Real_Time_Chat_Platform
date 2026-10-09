const express = require("express");
const router = express.Router();
const { authLimiter } = require("../middleware/rateLimiter");

const {
  loginHandler,
  signupHandler,
  logOutHandler,
} = require("../controllers/auth.controller");

router.post("/signup", authLimiter, signupHandler);
router.post("/login", authLimiter, loginHandler);
router.post("/logout", logOutHandler);

module.exports = router;
