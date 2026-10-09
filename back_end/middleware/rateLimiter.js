const rateLimit = require("express-rate-limit");

// Login/signup: guards against credential-stuffing and brute-force attempts.
// Keyed by IP (the default) since there's no logged-in user yet on these routes.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts. Please try again in a few minutes." },
});

// Sending messages: guards against one account spamming the DB/socket layer.
// Keyed by the authenticated user's id (falls back to IP if that's ever missing).
const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  message: { error: "You're sending messages too fast. Slow down a little." },
});

module.exports = { authLimiter, messageLimiter };
