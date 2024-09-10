import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { getEnvVariable } from "../utils";
import { db, rooms, eq, userRooms, and, messages } from "@repo/db";

const app = express();
const server = http.createServer(app);

declare module "socket.io" {
  interface Socket {
    user: {
      userId: string;
    };
  }
}

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const handleError = (socket: Socket, error: Error) => {
  console.error("Socket error:", error);
  socket.emit("error", "An error occurred");
};

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      throw new Error("Authentication error: No token provided");
    }
    const decoded = jwt.verify(token, getEnvVariable("JWT_SECRET"));
    if (!decoded) {
      throw new Error("Authentication error: Invalid token");
    }
    socket.user = decoded as { userId: string };
    next();
  } catch (error) {
    console.error("Error during authentication:", error);
    next(error instanceof Error ? error : new Error("Authentication error"));
  }
});

const usersMap = new Map<string, string>();

export const getUsersInRoom = async (roomId: string) => {
  // get socket ids of users in the room
  const users = await db
    .select()
    .from(userRooms)
    .where(eq(userRooms.roomId, parseInt(roomId)));
  
  const userIds = users.map((user) => user.userId.toString());
  const socketIds = userIds.map((userId) => usersMap.get(userId)).filter(Boolean);
  return socketIds;
};

io.on("connection", (socket) => {
  try {
    console.log("User Connected: ", socket.user);
    console.log("Socket ID: ", socket.id);
    usersMap.set(socket.user.userId, socket.id);
    io.emit("users", Array.from(usersMap.keys()));

    getUsersInRoom("1").then((socketIds) => {
      console.log("Socket IDs in room 1: ", socketIds);
    });

    socket.on("disconnect", () => {
      try {
        usersMap.delete(socket.user.userId);
        io.emit("users", Array.from(usersMap.keys()));
      } catch (error) {
        console.error("Error during disconnect:", error);
      }
    });
  } catch (error) {
    handleError(
      socket,
      error instanceof Error ? error : new Error("Unexpected error")
    );
  }
});

export { io, server, app };
