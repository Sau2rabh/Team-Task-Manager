const Message = require('../models/Message');
const { getIo } = require('../socket/socket');

exports.getGlobalMessages = async (req, res) => {
  try {
    const messages = await Message.find({ type: 'global' })
      .populate('sender', 'name email profilePicture')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.sendGlobalMessage = async (req, res) => {
  try {
    const { content } = req.body;
    
    const message = await Message.create({
      sender: req.user._id,
      content,
      type: 'global'
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email profilePicture');

    // Emit via socket
    const io = getIo();
    io.emit('new_message', populatedMessage);

    res.status(201).json(populatedMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDirectMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: userId, type: 'direct' },
        { sender: userId, recipient: req.user._id, type: 'direct' }
      ]
    })
      .populate('sender', 'name email profilePicture')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.sendDirectMessage = async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    
    const message = await Message.create({
      sender: req.user._id,
      recipient: recipientId,
      content,
      type: 'direct'
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email profilePicture')
      .populate('recipient', 'name email');

    // Emit via socket to both sender and recipient rooms
    const io = getIo();
    const rooms = [recipientId, req.user._id.toString()];
    const uniqueRooms = [...new Set(rooms)];
    
    uniqueRooms.forEach(room => {
      io.to(room).emit('new_private_message', populatedMessage);
    });

    res.status(201).json(populatedMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
