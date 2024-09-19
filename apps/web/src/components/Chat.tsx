"use client"
import React, { useState, useCallback, useMemo, useRef, useEffect, memo } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import { SearchIcon, SendIcon, MoreVerticalIcon } from "lucide-react";
import useListenMessages from '@/hooks/useListenMessages';

export interface Message {
    content: string;
    userId: string;
    messageId: string;
    roomId: string;
    sentAt: Date;
}

const ChatHeader = memo(() => (
    <header className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
            <Avatar>
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Alice" />
                <AvatarFallback>A</AvatarFallback>
            </Avatar>
            <h2 className="text-lg font-semibold">Alice</h2>
        </div>
        <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
                <SearchIcon className="h-5 w-5" />
                <span className="sr-only">Search</span>
            </Button>
            <Button variant="ghost" size="icon">
                <MoreVerticalIcon className="h-5 w-5" />
                <span className="sr-only">More options</span>
            </Button>
        </div>
    </header>
));

const ChatMessage = memo(({ message, isUser }: { message: Message; isUser: boolean }) => (
    <div className={`mb-4 ${isUser ? 'text-right' : 'text-left'}`}>
        <div className={`inline-block p-2 rounded-lg ${isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            <p className="font-semibold">{isUser ? 'You' : message.userId}</p>
            <p>{message.content}</p>
        </div>
    </div>
));

const ChatInput = memo(({ onSendMessage }: { onSendMessage: (content: string) => void }) => {
    const [newMessage, setNewMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            onSendMessage(newMessage);
            setNewMessage('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-grow"
            />
            <Button type="submit" size="icon">
                <SendIcon className="h-4 w-4" />
                <span className="sr-only">Send message</span>
            </Button>
        </form>
    );
});

export default function Chat({ roomId, initialMessages = [], userId }: { roomId: string; initialMessages?: Message[], userId: string }) {
    const { data: session } = useSession();
    const { messages, addMessage, refetchMessages } = useListenMessages({ roomId, initialMessages });
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const handleSendMessage = useCallback(async (content: string) => {
        try {
            const res = await fetch('http://localhost:8787/api/messages', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session?.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content, roomId })
            });

            if (!res.ok) {
                throw new Error('Error while sending message');
            }

            const data = await res.json();
            addMessage(data.message);
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    }, [session?.accessToken, roomId, addMessage]);

    const memoizedMessages = useMemo(() => messages, [messages]);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [memoizedMessages]);

    return (
        <div className="flex flex-col h-screen bg-background">
            <ChatHeader />
            <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
                <div className="flex flex-col">
                    {memoizedMessages.map((message) => (
                        <ChatMessage 
                            key={message.messageId} 
                            message={message} 
                            isUser={session?.user.userId === message.userId}
                        />
                    ))}
                </div>
            </ScrollArea>
            <div className="p-4 border-t">
                <ChatInput onSendMessage={handleSendMessage} />
            </div>
        </div>
    );
}
