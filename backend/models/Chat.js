const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const chatRoomSchema = new mongoose.Schema(
  {
    wholesalerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    retailerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    messages: [messageSchema], //  messages array
  },
  { timestamps: true }    
);

module.exports = mongoose.model("ChatRoom", chatRoomSchema);
