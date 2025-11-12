// socket.js
import { Server } from "socket.io"
let io

export const initializeSocketIO = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST", "PUT", "DELETE"]
    },
    pingTimeout: 60000,
    pingInterval: 25000 
  })

  io.on("connection", (socket) => {
    console.log("🔌 A user connected:", socket.id)

    socket.on("disconnect", () => {
      console.log("❌ A user disconnected:", socket.id)
    })
  })
}

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized!")
  }
  return io
}
