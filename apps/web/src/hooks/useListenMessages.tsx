import { useEffect, useState, useCallback, useRef } from 'react';
import { useSocket } from "@/context/SocketProvider";
import { useSession } from "next-auth/react";
import { getMessages } from "@/actions/rooms";
import { Message } from "@/components/Chat";

export default function useListenMessages({ roomId, initialMessages = [] }: { roomId: string; initialMessages?: Message[] }) {
    const { socket } = useSocket();
    const { data: session } = useSession();
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const messageIdsRef = useRef(new Set<string>());

    const fetchMessages = useCallback(async () => {
        if (!session?.user.userId) return;
        const res = await getMessages({
            roomId,
            userId: session.user.userId
        });
        if (res.status === 200) {
            setMessages(res.messages || []);
            messageIdsRef.current = new Set(res.messages?.map(m => m.messageId) || []);
        } else {
            console.error("Failed to fetch messages:", res.message);
        }
    }, [roomId, session?.user.userId]);

    useEffect(() => {
        if (initialMessages.length === 0) {
            fetchMessages();
        } else {
            messageIdsRef.current = new Set(initialMessages.map(m => m.messageId));
        }
    }, [fetchMessages, initialMessages]);

    useEffect(() => {
        if (!socket) return;
        const handleNewMessage = (newMessage: Message) => {
            setMessages((prevMessages) => {
                if (!messageIdsRef.current.has(newMessage.messageId)) {
                    messageIdsRef.current.add(newMessage.messageId);
                    return [...prevMessages, newMessage];
                }
                return prevMessages;
            });
        };
        socket.on("message", handleNewMessage);
        return () => {
            socket.off("message", handleNewMessage);
        };
    }, [socket]);

    const addMessage = useCallback((newMessage: Message) => {
        setMessages((prevMessages) => {
            if (!messageIdsRef.current.has(newMessage.messageId)) {
                messageIdsRef.current.add(newMessage.messageId);
                return [...prevMessages, newMessage];
            }
            return prevMessages;
        });
    }, []);

    return { messages, addMessage, refetchMessages: fetchMessages };
}