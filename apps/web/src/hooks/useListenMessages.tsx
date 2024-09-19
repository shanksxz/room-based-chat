import { useEffect, useState, useCallback } from 'react';
import { useSocket } from "@/context/SocketProvider";
import { useSession } from "next-auth/react";
import { getMessages } from "@/actions/rooms";
import { Message } from "@/components/Chat";

export default function useListenMessages({ roomId, initialMessages = [] }: { roomId: string; initialMessages?: Message[] }) {
    const { socket } = useSocket();
    const { data: session } = useSession();
    const [messages, setMessages] = useState<Message[]>(initialMessages);

    const fetchMessages = useCallback(async () => {
        if (!session?.user.userId) return;

        const res = await getMessages({
            roomId,
            userId: session.user.userId
        });

        if (res.status === 200) {
            setMessages(res.messages || []);
        } else {
            console.error("Failed to fetch messages:", res.message);
        }
    }, [roomId, session?.user.userId]);

    useEffect(() => {
        if (initialMessages.length === 0) {
            fetchMessages();
        }
    }, [fetchMessages, initialMessages.length]);

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (newMessage: Message) => {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        };

        socket.on("message", handleNewMessage);

        return () => {
            socket.off("message", handleNewMessage);
        };
    }, [socket]);

    const addMessage = useCallback((newMessage: Message) => {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
    }, []);

    return { messages, addMessage, refetchMessages: fetchMessages };
}