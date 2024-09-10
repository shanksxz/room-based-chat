import { and, db, eq, rooms, userRooms} from "@repo/db";
import { Request, Response } from "express";

export async function getUserRooms(req : Request, res : Response) {
    const userId = req.user.userId;

    try {
        const allRooms = await db.select().from(rooms).where(eq(rooms.createdBy, parseInt(userId)));

        if(allRooms.length === 0) {
            return res.status(200).json({ message: "No rooms found" });
        }

        return res.status(200).json({ rooms: allRooms });
    } catch (error) {
        console.error("Error while fetching rooms:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function createRoom(req : Request, res : Response) {
    console.log("Create room called");
    const userId = parseInt(req.user.userId);
    const { roomName } = req.body;

    console.log("User id:", userId);
    console.log("Room name:", roomName);

    try {
        // create room
        const room = await db.insert(rooms).values({
            roomName : roomName,
            createdBy : userId
        }).returning();

        // aslo create an entry in userRooms table as the user who created the room will be a part of the room
        await db.insert(userRooms).values({
            userId : userId,
            roomId : room[0].roomId
        }).returning();

        return res.status(201).json({ room : room[0]});
    } catch (error) {
        console.error("Error while creating room:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function joinRoom(req : Request, res : Response) {
    const userId = parseInt(req.user.userId);
    const { roomId } = req.body;

    try {
        // check if room exists
        const room = await db.select().from(rooms).where(eq(rooms.roomId, parseInt(roomId)));
        if(room.length === 0) {
            return res.status(404).json({ message: "Room not found" });
        }

        // check if user is already in the room
        const check = await db.select().from(userRooms).where(and(eq(userRooms.userId, userId), eq(userRooms.roomId, parseInt(roomId))));
        if(check.length > 0) {
            return res.status(400).json({ message: "User already in the room" });
        }

        // add user to the room
        await db.insert(userRooms).values({
            userId : userId,
            roomId : parseInt(roomId)
        }).returning();

        return res.status(200).json({ message: "User added to the room" });
    } catch (error) {
        console.error("Error while joining room:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}


export async function leaveRoom(req : Request, res : Response) {
    const userId = parseInt(req.user.userId);
    const { roomId } = req.body;

    try {
        // check if room exists
        const room = await db.select().from(rooms).where(eq(rooms.roomId, parseInt(roomId)));
        if(room.length === 0) {
            return res.status(404).json({ message: "Room not found" });
        }

        // check if user is in the room
        const check = await db.select().from(userRooms).where(and(eq(userRooms.userId, userId), eq(userRooms.roomId, parseInt(roomId))));
        if(check.length === 0) {
            return res.status(400).json({ message: "User not in the room" });
        }

        // remove user from the room
        await db.delete(userRooms).where(and(eq(userRooms.userId, userId), eq(userRooms.roomId, parseInt(roomId))));

        return res.status(200).json({ message: "User removed from the room" });
    } catch (error) {
        console.error("Error while leaving room:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}