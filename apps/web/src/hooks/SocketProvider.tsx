"use client"

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Socket, io } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  sendRoomMessage: (roomId: string, content: string) => void;
  onlineUsers: string[];
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const newSocket = io("http://localhost:8787", {
      auth: {
        token
      }
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    newSocket.on("users", (users: string[]) => {
      setOnlineUsers(users);
    });

    newSocket.on("error", (error: string) => {
      console.error("Socket error:", error);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const joinRoom = (roomId: string) => {
    if (socket) {
      socket.emit("join_room", roomId);
    }
  };

  const leaveRoom = (roomId: string) => {
    if (socket) {
      socket.emit("leave_room", roomId);
    }
  };

  const sendRoomMessage = (roomId: string, content: string) => {
    if (socket) {
      const data = JSON.stringify({ roomId, content });
      socket.emit("room_message", data);
    }
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    joinRoom,
    leaveRoom,
    sendRoomMessage,
    onlineUsers,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
