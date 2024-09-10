import { Request, Response } from "express";
import { z } from "zod";
import { and, db, eq, messages, userRooms } from "@repo/db";
import { getUsersInRoom, io } from "../socket";

const messageSchema = z.object({
  roomId: z.string(),
  text: z.string(),
});

export async function sendMessage(req: Request, res: Response) {
  try {
    console.log("sendMessage");
    console.log("req.body", req.body);
    // get roomId and text from request body
    const { roomId, text } = messageSchema.parse(req.body);

    const senderId = req.user.userId;

    console.log("roomId", roomId);
    console.log("text", text);
    console.log("senderId", senderId);

    // is user in the room?
    const check = await db
      .select()
      .from(userRooms)
      .where(
        and(
          eq(userRooms.userId, parseInt(senderId)),
          eq(userRooms.roomId, parseInt(roomId))
        )
      );

    if (check.length === 0) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // now we are sure user is in the room
    // insert message into messages table
    const foo = await db.insert(messages).values({
      roomId: parseInt(roomId),
      userId: parseInt(senderId),
      content: text,
    }).returning();

    // send message to all users in the room
    const socketIds = await getUsersInRoom(roomId);
    socketIds.forEach((socketId) => {
      io.to(socketId).emit("message", {
        roomId,
        userId: senderId,
        text,
        sentAt : foo[0].sentAt,
        messageId : foo[0].messageId
      });
    });

    return res.status(200).json({ message:  foo[0] });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Validation error", details: error.errors });
    }
  }
}

export async function getMessages(req: Request, res: Response) {
  try {
    const roomId = req.params.roomId;
    const userId = req.user.userId;

    // is user in the room?
    const check = await db
      .select()
      .from(userRooms)
      .where(
        and(
          eq(userRooms.userId, parseInt(userId)),
          eq(userRooms.roomId, parseInt(roomId))
        )
      );

      if(check.length === 0) {
        return res.status(403).json({message: "Forbidden"});
      }

    // get messages from messages table
    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.roomId, parseInt(roomId)));

    return res.status(200).json({ messages: msgs });

  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

