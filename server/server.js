const express = require('express');
const http = require('http');
const socketIo = require('socket.io').Server;
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = new socketIo(server, {
    cors:{
        origin:"*"
    }
});

mongoose.connect('mongodb://localhost:27017/socket').then(() => 
  console.log('Connected to MongoDB')
).catch(err => console.error('Could not connect to MongoDB', err));

const messageSchema = new mongoose.Schema({
  room: String,
  user: String,
  text: String,
  createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

const rooms = new Set();

io.on('connection', (socket) => {
  console.log('New client connected');

  io.emit('updateRooms', Array.from(rooms));

  socket.on('createRoom', (roomName) => {
    rooms.add(roomName);
    io.emit('updateRooms', Array.from(rooms));
  });

  socket.on('joinRoom', (roomName) => {
    socket.join(roomName);
    socket.room = roomName;
  });

  socket.on('sendMessage', async (message) => {
    const { user, text } = message;
    console.log(`Received message from ${user}: ${text}`);
    const newMessage = new Message({ room: socket.room, user, text });
    await newMessage.save();
    io.to(socket.room).emit('message', newMessage);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
