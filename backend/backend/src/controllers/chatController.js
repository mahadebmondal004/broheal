const mongoose = require('mongoose');
const Chat = require('../models/Chat');
const Booking = require('../models/Booking');
const UserMessage = require('../models/UserMessage');
const TherapistMessage = require('../models/TherapistMessage');
const AdminMessage = require('../models/AdminMessage');

exports.getChatByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ success: false, message: 'Invalid bookingId' });
    }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  if (req.user.role !== 'admin') {
    const isParticipant = [booking.userId.toString(), booking.therapistId.toString()].includes(req.user._id.toString());
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Not allowed' });
    }
  }

  if (booking.status === 'completed' || booking.paymentStatus === 'success') {
    return res.status(403).json({ success: false, message: 'Chat is disabled for this booking' });
  }

  let chat = await Chat.findOne({ bookingId });
  if (!chat) {
    chat = await Chat.create({ bookingId, userId: booking.userId, therapistId: booking.therapistId, messages: [] });
  }

  const adminMsgs = await AdminMessage.find({ bookingId }).lean();
  const combined = [
    ...chat.messages.map(m => ({
      sender: m.sender,
      senderRole: m.senderRole,
      message: m.message,
      messageType: m.messageType,
      attachmentUrl: m.attachmentUrl,
      read: m.read,
      timestamp: m.timestamp
    })),
    ...adminMsgs.map(m => ({
      sender: m.sender,
      senderRole: 'admin',
      message: m.message,
      messageType: m.messageType,
      attachmentUrl: m.attachmentUrl || null,
      read: m.read || false,
      timestamp: m.timestamp
    }))
  ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const data = chat.toObject();
  data.messages = combined;
  return res.status(200).json({ success: true, chat: data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.postMessage = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { message, messageType = 'text', attachmentUrl = null } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ success: false, message: 'Invalid bookingId' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (req.user.role !== 'admin') {
      const isParticipant = [booking.userId.toString(), booking.therapistId.toString()].includes(req.user._id.toString());
      if (!isParticipant) {
        return res.status(403).json({ success: false, message: 'Not allowed' });
      }
    }

    if (booking.status === 'completed' || booking.paymentStatus === 'success') {
      return res.status(403).json({ success: false, message: 'Chat is disabled for this booking' });
    }

    let chat = await Chat.findOne({ bookingId });
    if (!chat) {
      chat = await Chat.create({ bookingId, userId: booking.userId, therapistId: booking.therapistId, messages: [] });
    }

    const basePayload = {
      sender: req.user._id,
      message,
      messageType,
      attachmentUrl,
      read: false,
      timestamp: new Date()
    };

    if (req.user.role === 'admin') {
      await AdminMessage.create({ bookingId, sender: req.user._id, receiver: booking.therapistId, message, messageType, timestamp: basePayload.timestamp });
      const adminMsgs = await AdminMessage.find({ bookingId }).lean();
      const combined = [
        ...chat.messages.map(m => ({
          sender: m.sender,
          senderRole: m.senderRole,
          message: m.message,
          messageType: m.messageType,
          attachmentUrl: m.attachmentUrl,
          read: m.read,
          timestamp: m.timestamp
        })),
        ...adminMsgs.map(m => ({
          sender: m.sender,
          senderRole: 'admin',
          message: m.message,
          messageType: m.messageType,
          attachmentUrl: m.attachmentUrl || null,
          read: m.read || false,
          timestamp: m.timestamp
        }))
      ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      const data = chat.toObject();
      data.messages = combined;
      return res.status(201).json({ success: true, chat: data });
    }

    const payload = { ...basePayload, senderRole: req.user.role };
    chat.messages.push(payload);
    await chat.save();

    if (req.user.role === 'user') {
      await UserMessage.create({ bookingId, sender: req.user._id, receiver: booking.therapistId, message, messageType, timestamp: payload.timestamp });
    } else if (req.user.role === 'therapist') {
      await TherapistMessage.create({ bookingId, sender: req.user._id, receiver: booking.userId, message, messageType, timestamp: payload.timestamp });
    }

    return res.status(201).json({ success: true, chat });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.postAdminMessage = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admin can send admin messages' });
    }
  let { receiverId, message, messageType = 'text', bookingId = null } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, message: 'Message is required' });
  }
  if (bookingId && !mongoose.Types.ObjectId.isValid(bookingId)) {
    bookingId = null;
  }
  if (!receiverId && bookingId) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (booking.status === 'completed' || booking.paymentStatus === 'success') {
      return res.status(403).json({ success: false, message: 'Chat is disabled for this booking' });
    }
    receiverId = booking.therapistId;
  }
  if (!receiverId) {
    return res.status(400).json({ success: false, message: 'receiverId is required' });
  }
  const payload = await AdminMessage.create({ bookingId, sender: req.user._id, receiver: receiverId, message, messageType, timestamp: new Date() });
  return res.status(201).json({ success: true, message: payload });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
