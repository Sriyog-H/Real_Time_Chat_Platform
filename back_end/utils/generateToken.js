const jwt = require("jsonwebtoken");

// create token and attach it to the response as an httpOnly cookie
function generateTokenAndSetcookie(userId, res) {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });

  res.cookie("jwt", token, {
    maxAge: 15 * 24 * 60 * 60 * 1000,
    httpOnly: true, // JS on the page can't read this cookie (mitigates XSS token theft)
    sameSite: "strict", // browser won't attach this cookie on cross-site requests (mitigates CSRF)
    secure: process.env.NODE_ENV === "production", // only sent over HTTPS once deployed
  });
}

module.exports = generateTokenAndSetcookie;
