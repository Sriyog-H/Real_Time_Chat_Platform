const Message = require("../model/message.model");
const Conversation = require("../model/conversation.model");
const { io, getReceiverSocket } = require("../sockte/socket");

async function sendMessage(req, res) {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    // Message.create() already persists the document — no need to call
    // .save() on it again afterwards (the old code did both, redundantly)
    const newMessage = await Message.create({ senderId, receiverId, message });

    conversation.messages.push(newMessage._id);
    await conversation.save();

    // Deliver in real time if the receiver is connected right now. If they're
    // not, the message is already safely in Mongo — they'll get it from
    // receiveMessage() the next time they open the chat, and get a proper
    // "delivered" tick retroactively once their client re-fetches it.
    const receiverSocket = await getReceiverSocket(receiverId.toString());
    if (receiverSocket) {
      io.to(receiverSocket).emit("newMessage", newMessage);
    }

    return res.status(201).json(newMessage);
  } catch (error) {
    console.log("error in sendMessage controller ", error.message);
    return res.status(500).json({ error: "internal server error!" });
  }
}

async function receiveMessage(req, res) {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user._id;

    // cursor-based pagination: `before` is an ISO timestamp cursor, `limit`
    // caps the page size (defaults to 20, hard-capped at 50 so a client
    // can't force one query to pull an entire multi-year history)
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
    const before = req.query.before;

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, userToChatId] },
    });

    if (!conversation) {
      return res.status(200).json({ messages: [], hasMore: false });
    }

    const query = { _id: { $in: conversation.messages } };
    if (before) {
      const beforeDate = new Date(before);
      if (!isNaN(beforeDate.getTime())) {
        query.createdAt = { $lt: beforeDate };
      }
    }

    // fetch newest-first (so "limit" always means "the most recent N older
    // than the cursor"), grab one extra to know if there's another page,
    // then flip back to oldest-first for rendering
    const page = await Message.find(query).sort({ createdAt: -1 }).limit(limit + 1);

    const hasMore = page.length > limit;
    const messages = page.slice(0, limit).reverse();

    return res.status(200).json({ messages, hasMore });
  } catch (error) {
    console.log("error in receiverMessage controller ", error.message);
    return res.status(500).json({ error: "internal server error!" });
  }
}

async function reactToMessage(req, res) {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id.toString();

    if (!emoji) {
      return res.status(400).json({ msg: "Emoji required" });
    }

    const messageOfReaction = await Message.findById(messageId);
    if (!messageOfReaction) {
      return res.status(404).json({ msg: "Message not found" });
    }

    // only the two people in this conversation may react to the message —
    // previously any authenticated user could react to any messageId
    const participantIds = [
      messageOfReaction.senderId.toString(),
      messageOfReaction.receiverId.toString(),
    ];
    if (!participantIds.includes(userId)) {
      return res.status(403).json({ msg: "Not authorized to react to this message" });
    }

    const reactions = messageOfReaction.reactions; // [{emoji, users[]}]

    let reqEmoji = reactions.find((r) => r.emoji === emoji);
    const userAlreadyReacted = reqEmoji
      ? reqEmoji.users.some((id) => id.toString() === userId)
      : false;

    // remove this user from every existing reaction first
    reactions.forEach((reaction) => {
      reaction.users = reaction.users.filter((id) => id.toString() !== userId);
    });

    if (!userAlreadyReacted) {
      if (reqEmoji) {
        reqEmoji.users.push(userId);
      } else {
        messageOfReaction.reactions.push({ emoji, users: [userId] });
      }
    }

    messageOfReaction.reactions = messageOfReaction.reactions.filter(
      (r) => r.users.length > 0
    );

    await messageOfReaction.save();

    const plainReactions = messageOfReaction.reactions.map((r) => ({
      _id: r._id.toString(),
      emoji: r.emoji,
      users: r.users.map((u) => u.toString()),
    }));

    // Notify only the two people in this conversation, not every connected
    // client. The old code used io.emit(...), which broadcast every
    // reaction (message id + emoji) to every online user regardless of
    // whether they were part of that conversation.
    const payload = { messageId: messageId.toString(), reactions: plainReactions };
    for (const participantId of participantIds) {
      const participantSocket = await getReceiverSocket(participantId);
      if (participantSocket) {
        io.to(participantSocket).emit("reactionUpdated", payload);
      }
    }

    res.status(200).json(plainReactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
}

module.exports = {
  sendMessage,
  receiveMessage,
  reactToMessage,
};

// participants: { $all: [senderId, receiverId] }
// Find a conversation where senderId is inside the participants array
// AND receiverId is also inside the same array.
// Only if both are present does it return the conversation.
