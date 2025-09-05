const express = require("express") ;
const ChatRoom = require("../models/Chat.js");
const User = require("../models/user.js");

const router = express.Router();

// Create or Get chat room
router.post("/create-room", async (req, res) => {   // 👈 name match frontend
  const { retailerId, wholesalerId } = req.body;

  if (!retailerId || !wholesalerId) {
    return res.status(400).json({ error: "Missing IDs" });
  }

  try {
    let room = await ChatRoom.findOne({ retailerId, wholesalerId });

    if (!room) {
      room = await ChatRoom.create({ retailerId, wholesalerId, messages: [] });
    }

    res.json(room);
  } catch (err) {
    res.status(500).json({ error: "Failed to create/get room" });
  }
});

// Save new message
router.post("/message", async (req, res) => {
  const { chatId, senderId, text } = req.body;

  if (!chatId || !senderId || !text) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const room = await ChatRoom.findById(chatId);
    if (!room) return res.status(404).json({ error: "Chat not found" });

    const message = { senderId, text };
    room.messages.push(message);
    await room.save();

    res.json(message);
  } catch (err) {
    res.status(500).json({ error: "Failed to save message" });
  }
});

// Fetch all messages in a room
router.get("/:chatId/messages", async (req, res) => {
  try {
    const room = await ChatRoom.findById(req.params.chatId).populate("messages.senderId", "name");
    if (!room) return res.status(404).json({ error: "Chat not found" });

    res.json(room.messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Fetch all retailers (for wholesaler to choose)
router.get("/retailers", async (req, res) => {   // 👈 yaha /retailers rakho
  try {
    const retailers = await User.find({ role: "retailer" })
      .select("_id name email phone company_name");

    res.json(retailers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
