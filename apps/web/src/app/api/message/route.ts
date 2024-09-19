import { db, eq, messages } from "@repo/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const roomId = searchParams.get('roomId');
        console.log("roomId", roomId);

        if (!roomId) {
            return NextResponse.json({
                error: "Room ID is required"
            }, {
                status: 400
            });
        }

        const allMessages = await db.select().from(messages).where(eq(messages.roomId, parseInt(roomId)));
        console.log("allMessages", allMessages);

        if (allMessages.length > 0) {
            // Map the messages to a plain object to avoid circular reference issues
            const sanitizedMessages = allMessages.map(message => ({
                messageId: message.messageId,
                roomId: message.roomId,
                userId: message.userId,
                content: message.content,
                sentAt: message.sentAt.toISOString()
            }));

            return NextResponse.json({
                messages: sanitizedMessages
            }, {
                status: 200
            });
        }

        return NextResponse.json({
            message: "No messages found"
        }, {
            status: 404
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({
            error: "Failed to fetch messages. Please try again."
        }, {
            status: 500
        });
    }
}