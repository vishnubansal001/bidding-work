import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";

const ENDPOINT = "http://localhost:5000";
const socket = socketIOClient(ENDPOINT);

function App() {
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState("");
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");

  console.log("rooms", messages);

  useEffect(() => {
    socket.on("updateRooms", (updatedRooms) => {
      setRooms(updatedRooms);
    });
    socket.on("message", (newMessage) => {
      console.log(newMessage);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });
    return () => {
      socket.off("updateRooms");
      socket.off("message");
    }
  }, []);

  const handleCreateRoom = () => {
    const roomName = prompt("Enter room name:");
    if (roomName) {
      socket.emit("createRoom", roomName);
    }
  };

  const handleJoinRoom = (roomName) => {
    setCurrentRoom(roomName);
    socket.emit("joinRoom", roomName);
  };

  const handleSendMessage = () => {
    const user = prompt("Enter your name:");
    if (user && inputMessage) {
      socket.emit("sendMessage", { user, text: inputMessage });
      setInputMessage("");
    }
  };

  return (
    <div>
      <h1>Socket.io Chat Rooms</h1>
      {rooms.length === 0 ? (
        <button onClick={handleCreateRoom}>Create Room</button>
      ) : (
        <>
          <ul>
            {rooms.map((room) => (
              <li key={room} onClick={() => handleJoinRoom(room)}>
                {room}
              </li>
            ))}
          </ul>
          <button onClick={handleCreateRoom}>Create Room</button>
        </>
      )}
      {currentRoom && (
        <div>
          <h2>Room: {currentRoom}</h2>
          <button onClick={() => setCurrentRoom("")}>Exit Room</button>
          <br />
          <div>
            {messages.map((message, index) => (
              <div key={index}>
                <strong>{message.user}: </strong>
                {message.text}
              </div>
            ))}
          </div>
          <br />
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      )}
    </div>
  );
}

export default App;
