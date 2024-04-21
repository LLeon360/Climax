import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("a user connected");

    socket.on("disconnect", () => {
      console.log("user disconnected");
      const rooms = Array.from(socket.rooms);
      rooms.forEach(room => {
        if (room !== socket.id) {
          socket.to(room).emit('userLeft', socket.id);
        }
      });
    });

    socket.on('signal', ({ to, signalData, from }) => {
        console.log("recieved signal signal from", from, "to", to)
        io.to(to).emit('receiving signal', { signalData, from });
      });

    socket.on('joinRoom', ({ roomcode, userId }) => {
      console.log("joinRoom", roomcode, "by user", userId);
      socket.join(roomcode);
      socket.to(roomcode).emit('userJoined', { socketId: socket.id, userId});

      io.in(roomcode).allSockets().then(sockets => {
        console.log(`All clients in room ${roomcode}:`, Array.from(sockets));
      });
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});

