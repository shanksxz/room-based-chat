"use client"

import React, { useState, useCallback, useMemo, useRef, useEffect, memo } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import { Search, MoreVertical, Send, X, Users, Calendar, LogOut } from "lucide-react";
import useListenMessages from '@/hooks/useListenMessages';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu"
import { getRoomInfo } from '@/actions/rooms';

export interface Message {
    content: string;
    userId: string;
    messageId: string;
    roomId: string;
    sentAt: Date;
}

interface RoomInfo {
    roomName: string;
    createdBy: string;
    createdAt: Date;
    users: string[];
}

const ChatHeader = memo(({ roomInfo, onLeaveRoom }: { roomInfo: RoomInfo; onLeaveRoom: () => void }) => (
    <header className="border-b p-4 flex items-center justify-between bg-white">
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" className="p-0">
                    <div className="flex items-center space-x-4">
                        <Avatar>
                            <AvatarImage src="/placeholder.svg?height=40&width=40" alt={roomInfo.roomName} />
                            <AvatarFallback>{roomInfo.roomName[0]}</AvatarFallback>
                        </Avatar>
                        <h2 className="text-lg font-semibold">{roomInfo.roomName}</h2>
                    </div>
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>{roomInfo.roomName}</SheetTitle>
                    <SheetDescription>Room Information</SheetDescription>
                </SheetHeader>
                <div className="mt-4 space-y-4">
                    <div className="flex items-center space-x-2">
                        <Users className="h-5 w-5" />
                        <span>Users: {roomInfo.users.join(', ')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5" />
                        <span>Created on: {new Date(roomInfo.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Avatar className="h-5 w-5">
                            <AvatarFallback>{roomInfo.createdBy[0]}</AvatarFallback>
                        </Avatar>
                        <span>Created by: {roomInfo.createdBy}</span>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
        <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5" />
                        <span className="sr-only">More options</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onLeaveRoom}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Leave Room</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    </header>
));

const ChatMessage = memo(({ message, isUser }: { message: Message; isUser: boolean }) => (
    <div className={`mb-4 ${isUser ? 'text-right' : 'text-left'}`}>
        <div className={`inline-block p-2 rounded-lg ${isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
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
        <form onSubmit={handleSubmit} className="flex items-center space-x-2 bg-white p-4">
            <Button type="button" variant="ghost" size="icon">
                <span className="sr-only">Attach file</span>
            </Button>
            <Input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-grow bg-gray-100"
            />
            <Button type="submit" size="icon" className="bg-gray-900 text-white">
                <Send className="h-4 w-4" />
                <span className="sr-only">Send message</span>
            </Button>
        </form>
    );
});

export default function Chat({ roomId, initialMessages = [], userId }: { roomId: string; initialMessages?: Message[]; userId: string }) {
    const { data: session } = useSession();
    const { messages, addMessage } = useListenMessages({ roomId, initialMessages });
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const [roomInfo, setRoomInfo] = useState<RoomInfo>({
        roomName: 'Loading...',
        createdBy: 'Loading...',
        createdAt: new Date(),
        users: ['Loading...'],
    });

    useEffect(() => {
        (async () => {
            const res = await getRoomInfo({ roomId });
            if (res.status !== 200 || !res.roomInfo) {
                console.error('Error fetching room info:', res.message);
                return;
            }
            setRoomInfo(res.roomInfo);
        })();

    }, [roomId, session?.accessToken]);

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

    const handleLeaveRoom = useCallback(async () => {
        try {
            const res = await fetch(`http://localhost:8787/api/rooms/${roomId}/leave`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session?.accessToken}`,
                },
            });
            if (!res.ok) throw new Error('Failed to leave room');
            window.location.href = '/';
        } catch (error) {
            console.error('Error leaving room:', error);
        }
    }, [roomId, session?.accessToken]);

    const memoizedMessages = useMemo(() => messages, [messages]);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [memoizedMessages]);

    return (
        <div className="flex flex-col w-full h-screen bg-gray-100">
            <ChatHeader roomInfo={roomInfo} onLeaveRoom={handleLeaveRoom} />
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
            <ChatInput onSendMessage={handleSendMessage} />
        </div>
    );
}
