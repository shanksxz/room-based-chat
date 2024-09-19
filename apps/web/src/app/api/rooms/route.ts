import { NextResponse } from "next/server";
import { db, rooms } from "@repo/db";

export async function GET(req: Request) {
    try {
        const roomList = await db.select().from(rooms);

        console.log("roomList", roomList);

        
        if(roomList.length > 0) {
            return NextResponse.json({
                rooms: roomList
            }, {
                status: 200
            });
        }


        return NextResponse.json({
            message: "No rooms found"
        }, {
            status: 404
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({
            error: "Failed to fetch rooms. Please try again."
        }, {
            status: 500
        });
    }
}