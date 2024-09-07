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
    next(error instanceof Error ? error : new Error("Authentication error"));
  }
});

const usersMap = new Map<string, string>();

io.on("connection", (socket) => {
  try {
    console.log("User Connected: ", socket.user);
    usersMap.set(socket.user.userId, socket.id);
    io.emit("users", Array.from(usersMap.keys()));

    socket.on("join_room", async (roomId: string) => {
      try {
        const room = await db.select().from(rooms).where(eq(rooms.id, parseInt(roomId)));
        if (room.length > 0) {
          socket.join(roomId);
          const joinedRoom = await db.insert(userRooms).values({ 
            userId: parseInt(socket.user.userId), 
            roomId: parseInt(roomId) 
          }).returning();
          io.to(roomId).emit("joined_room", { roomId, userId: socket.user.userId });
        } else {
          throw new Error("Room not found");
        }
      } catch (error) {
        handleError(socket, error instanceof Error ? error : new Error("Error joining room"));
      }
    });

    socket.on("leave_room", async (roomId: string) => {
      try {
        const room = await db.select().from(rooms).where(eq(rooms.id, parseInt(roomId)));
        if (room.length > 0) {
          socket.leave(roomId);
          await db.delete(userRooms).where(
            and(
              eq(userRooms.userId, parseInt(socket.user.userId)),
              eq(userRooms.roomId, parseInt(roomId))
            ));
          io.to(roomId).emit("left_room", { roomId, userId: socket.user.userId });
        } else {
          throw new Error("Room not found");
        }
      } catch (error) {
        handleError(socket, error instanceof Error ? error : new Error("Error leaving room"));
      }
    });

    socket.on("room_message", async (data) => {
      try {
        let parsedData;
        try {
          parsedData = JSON.parse(data);
        } catch (error) {
          throw new Error("Invalid JSON data");
        }

        const { roomId, content } = parsedData;
        console.log("Room Message:", roomId, content, socket.user.userId);

        const userInRoom = await db.select()
          .from(userRooms)
          .where(
            and(
              eq(userRooms.userId, parseInt(socket.user.userId)),
              eq(userRooms.roomId, parseInt(roomId))
            )
          );

        if (userInRoom.length === 0) {
          throw new Error("User not in room");
        }

        const msg = await db.insert(messages).values({
          roomId: parseInt(roomId),
          userId: parseInt(socket.user.userId),
          content: content
        }).returning();

        console.log("Message inserted:", msg[0]);
        io.to(roomId).emit("room_message", {
          id: msg[0].id,
          userId: socket.user.userId,
          message: msg[0].content,
          sentAt: msg[0].sentAt
        });
        console.log("Message emitted to room:", roomId);
      } catch (error) {
        handleError(socket, error instanceof Error ? error : new Error("Error processing room message"));
      }
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
    handleError(socket, error instanceof Error ? error : new Error("Unexpected error"));
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

export { io, server };
