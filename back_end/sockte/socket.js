const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const Message = require("../model/message.model");

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ---- Presence store ----------------------------------------------------
// { userId: socketId } kept in memory so a single instance works out of
// the box with zero setup. The moment REDIS_URL is set, the same mapping
// is also kept in Redis (a shared hash all instances can read), and the
// Socket.IO Redis adapter is attached so io.to(socketId).emit(...) reaches
// that socket no matter which instance it's actually connected to. That
// combination — shared presence lookup + a pub/sub adapter for cross-node
// emits — is what actually lets this run behind a load balancer with more
// than one server process. Without both pieces, only individual servers
// would know about their own users.
const localUserSocketMap = {};
let redisClient = null;

async function initRedis() {
  if (!process.env.REDIS_URL) {
    console.log("REDIS_URL not set — running single-instance (no horizontal scaling)");
    return;
  }

  const { createClient } = require("redis");
  const { createAdapter } = require("@socket.io/redis-adapter");

  const pubClient = createClient({ url: process.env.REDIS_URL });
  const subClient = pubClient.duplicate();

  pubClient.on("error", (err) => console.error("Redis pub client error:", err.message));
  subClient.on("error", (err) => console.error("Redis sub client error:", err.message));

  await Promise.all([pubClient.connect(), subClient.connect()]);

  io.adapter(createAdapter(pubClient, subClient));
  redisClient = pubClient;

  console.log("Redis adapter connected — Socket.IO can now run across multiple instances");
}

async function setUserSocket(userId, socketId) {
  localUserSocketMap[userId] = socketId;
  if (redisClient) {
    await redisClient.hSet("online_users", userId, socketId);
  }
}

async function removeUserSocket(userId) {
  delete localUserSocketMap[userId];
  if (redisClient) {
    await redisClient.hDel("online_users", userId);
  }
}

async function getReceiverSocket(userId) {
  if (!userId) return null;
  if (redisClient) {
    return await redisClient.hGet("online_users", userId.toString());
  }
  return localUserSocketMap[userId] || null;
}

async function getAllOnlineUserIds() {
  if (redisClient) {
    return await redisClient.hKeys("online_users");
  }
  return Object.keys(localUserSocketMap);
}

// ---- Connection handling ------------------------------------------------
io.on("connection", (socket) => {
  console.log("user connected:", socket.id);
  const userId = socket.handshake.query.userId;

  if (userId) {
    setUserSocket(userId, socket.id)
      .then(getAllOnlineUserIds)
      .then((ids) => io.emit("getOnlineUsers", ids))
      .catch((err) => console.error("connection setup failed:", err.message));
  }

  // message delivered confirmation
  socket.on("message:delivered", async ({ messageId }) => {
    try {
      if (!messageId || !userId) return;

      const message = await Message.findById(messageId);
      if (!message) return;

      // only the actual receiver can mark a message delivered
      if (message.receiverId.toString() !== userId) return;

      const updatedMessage = await Message.findByIdAndUpdate(
        messageId,
        { $addToSet: { deliveredTo: { userId, deliveredAt: new Date() } } },
        { new: true }
      );

      const senderSocket = await getReceiverSocket(updatedMessage.senderId.toString());
      if (senderSocket) {
        io.to(senderSocket).emit("message:delivered:update", {
          messageId: updatedMessage._id,
        });
      }
    } catch (err) {
      console.error("delivery update failed", err.message);
    }
  });

  // message read confirmation
  socket.on("message:read", async ({ messageId }) => {
    try {
      if (!messageId || !userId) return;

      const message = await Message.findById(messageId);
      if (!message) return;

      // only the actual receiver can mark a message read
      if (message.receiverId.toString() !== userId) return;

      const updatedMessage = await Message.findByIdAndUpdate(
        messageId,
        { $addToSet: { readBy: { userId, readAt: new Date() } } },
        { new: true }
      );

      const senderSocket = await getReceiverSocket(updatedMessage.senderId.toString());
      if (senderSocket) {
        io.to(senderSocket).emit("message:read:update", {
          messageId: updatedMessage._id,
        });
      }
    } catch (error) {
      console.error("read update failed", error.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected:", socket.id);

    if (userId) {
      removeUserSocket(userId)
        .then(getAllOnlineUserIds)
        .then((ids) => io.emit("getOnlineUsers", ids))
        .catch((err) => console.error("disconnect cleanup failed:", err.message));
    }
  });
});

module.exports = { server, app, io, initRedis, getReceiverSocket };
