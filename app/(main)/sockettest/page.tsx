"use client";
import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket;

interface Message {
  username: string;
  message: string;
}

const Home: React.FC = () => {
  const [message, setMessage] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [allMessages, setAllMessages] = useState<Message[]>([]);

  useEffect(() => {
    socketInitializer();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  async function socketInitializer() {
    await fetch("/api/socket");
    console.log("here");
    socket = io();

    socket.on("receive-message", (data: Message) => {
      setAllMessages((prev) => [...prev, data]);
    });
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    console.log("emitted");

    if (socket) {
      socket.emit("send-message", {
        username,
        message,
      });
    }

    setMessage("");
  }

  return (
    <div>
      <h1>Chat app</h1>
      <h1>Enter a username</h1>
      <input
        value={username}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setUsername(e.target.value)
        }
      />

      <br />
      <br />

      <div>
        {allMessages.map((msg, index) => (
          <div key={index}>
            {msg.username}: {msg.message}
          </div>
        ))}

        <br />

        <form onSubmit={handleSubmit}>
          <input
            name="message"
            placeholder="Enter your message"
            value={message}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setMessage(e.target.value)
            }
            autoComplete="off"
          />
        </form>
      </div>
    </div>
  );
};

export default Home;
