import { NextApiRequest, NextApiResponse } from "next";
import { Server, Socket } from "socket.io";

export default function SocketHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("API Route Hit"); // Check if this logs when you access /api/socket from the client
  if ((res.socket as any).server.io) {
    console.log("Already set up");
    res.end();
    return;
  }

  const io = new Server((res.socket as any).server);
  console.log("Server setup");

  (res.socket as any).server.io = io;

  io.on("connection", (socket: Socket) => {
    console.log("Socket connected"); // To check connection status
    socket.on("send-message", (obj: any) => {
      io.emit("receive-message", obj);
    });
  });

  res.end();
}
