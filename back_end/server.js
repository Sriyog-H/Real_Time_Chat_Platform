const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

dotenv.config();

const authRoutes = require("./routes/auth.routes.js");
const messageRoutes = require("./routes/message.routes.js");
const userRoutes = require("./routes/user.routes.js");

const connectTomongoDB = require("./db/connectTomongodb");
const { server, app, io, initRedis } = require("./sockte/socket");

const PORT = process.env.PORT || 5000;

// Correct client IPs when running behind a reverse proxy (Render/Heroku/etc.) —
// without this, express-rate-limit would rate-limit the proxy's IP instead
// of each real visitor's IP.
app.set("trust proxy", 1);

// MIDDLEWARE
app.use(express.json()); // needed to read the request body, parses incoming JSON payloads
app.use(cookieParser());

// serve the built frontend
app.use(express.static(path.join(__dirname, "../front_end/dist")));

app.use("/api/auth/", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../front_end/dist/index.html"));
});

async function start() {
  await connectTomongoDB();
  await initRedis(); // no-op if REDIS_URL isn't set — falls back to single-instance mode
  server.listen(PORT, () => console.log(`server is running at port ${PORT}`));
}

start();
