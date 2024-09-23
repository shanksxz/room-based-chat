"use server";
import { and, db, eq, messages, rooms, userRooms } from "@repo/db";

// get chat messages for an particular room
interface foo {
  roomId: string;
  userId: string;
}

export async function check({ roomId, userId }: foo) {
  try {
    const check = await db
      .select()
      .from(userRooms)
      .where(
        and(
          eq(userRooms.userId, parseInt(userId)),
          eq(userRooms.roomId, parseInt(roomId))
        )
      );
    if (check.length === 0) {
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
}

export async function getMessages({ roomId, userId }: foo) {
  try {
    // is user in the room?
    console.log("dhvbdvjdv", roomId, userId);
    const inRoom = await check({ roomId, userId });

    if (!inRoom) {
      return { status: 403, message: "Forbidden" };
    }

    const foo = await db
      .select()
      .from(messages)
      .where(eq(messages.roomId, parseInt(roomId)));

    const boo = foo.map((message) => {
      return {
        messageId: message.messageId.toString(),
        userId: message.userId.toString(),
        roomId: message.roomId.toString(),
        content: message.content,
        sentAt: message.sentAt,
      };
    });

    return { status: 200, messages: boo };
  } catch (error) {
    return { status: 500, message: "Internal server error" };
  }
}

export async function getRoomName({ roomId }: { roomId: string }) {
  const foo = await db
    .select()
    .from(rooms)
    .where(eq(rooms.roomId, parseInt(roomId)));
  return foo[0].roomName;
}

export async function getRoomInfo({ roomId }: { roomId: string }) {
  try {
    const foo = await db
      .select()
      .from(rooms)
      .where(eq(rooms.roomId, parseInt(roomId)));

    const users = await db
      .select()
      .from(userRooms)
      .where(eq(userRooms.roomId, parseInt(roomId)));

    const bar = foo.map((room) => {
      return {
        roomName: room.roomName,
        createdBy: room.createdBy.toLocaleString(),
        createdAt: room.createdAt,
        users: users.map((user) => user.userId.toLocaleString()),
      };
    });

    return { status: 200, roomInfo: bar[0] };
  } catch (error) {
    return { status: 500, message: "Internal server error" };
  }
}

export async function getUsersRoom({ userId }: { userId: string }) {
  try {
    const foo = await db
      .select()
      .from(userRooms)
      .where(eq(userRooms.userId, parseInt(userId)));

    if (foo.length === 0) {
      return { status: 404, message: "Room not found" };
    }

    // convert both userId and roomId to string
    const bar : {
        userId: string;
        roomId: string;
        joinedAt: Date;
        roomName: string;
    }[] = foo.map((room) => {
      return {
        userId: room.userId.toString(),
        roomId: room.roomId.toString(),
        joinedAt: room.joinedAt,
        roomName : ""
      };
    });

    // get room name
    for (let i = 0; i < bar.length; i++) {
      bar[i].roomName= await getRoomName({ roomId: bar[i].roomId });
    }

    return { status: 200, rooms: bar };
  } catch (error) {
    return { status: 500, message: "Internal server error" };
  }
}
