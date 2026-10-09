const jwt = require("jsonwebtoken");
const User = require("../model/user.model");

async function protectRoute(req, res, next) {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ error: "unauthorized - no token found" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ error: "unauthorized - token is invalid" });
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    // jwt.verify throws on an expired/malformed token — that's a client
    // auth problem (401), not a server failure (500)
    console.log("error in protectRoute : ", error.message);
    return res.status(401).json({ error: "unauthorized - invalid or expired token" });
  }
}

module.exports = protectRoute;

// decoded is an object with the fields you passed in at token generation:
// {
//   userId: "67485c9a93a1fc2a91",
//   iat: 1733766280,
//   exp: 1734975880
// }
