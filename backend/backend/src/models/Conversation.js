const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema({
  bookingId: { type: String },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Conversation", ConversationSchema);
