"use client"
import { useSession } from 'next-auth/react';
import { createContext, useContext, ReactNode, useState, useEffect, useCallback, useMemo } from 'react';
import { Socket, io } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  // joinRoom: (roomId: string) => void;
  // leaveRoom: (roomId: string) => void;
  // sendRoomMessage: (roomId: string, content: string) => void;
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
  const { data: session, status } = useSession();

  useEffect(() => {
    console.log("Session status:", status);
    console.log("Session data:", session);

    if (status !== "authenticated" || !session?.accessToken) {
      console.log("No valid session or token. Skipping socket connection.");
      return;
    }

    console.log("Attempting to connect socket with token:", session.accessToken);

    const newSocket = io("http://localhost:8787", {
      auth: { token: session.accessToken },
      transports: ['websocket'],
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });

    const onConnect = () => {
      console.log("Socket connected successfully");
      setIsConnected(true);
    };

    const onDisconnect = (reason : any) => {
      console.log("Socket disconnected. Reason:", reason);
      setIsConnected(false);
    };

    const onUsers = (users: string[]) => {
      console.log("Received online users:", users);
      setOnlineUsers(users);
    };

    const onError = (error: string) => {
      console.error("Socket error:", error);
    };

    newSocket.on("connect", onConnect);
    newSocket.on("disconnect", onDisconnect);
    newSocket.on("users", onUsers);
    newSocket.on("error", onError);

    setSocket(newSocket);

    return () => {
      console.log("Cleaning up socket connection");
      newSocket.off("connect", onConnect);
      newSocket.off("disconnect", onDisconnect);
      newSocket.off("users", onUsers);
      newSocket.off("error", onError);
      newSocket.disconnect();
    };
  }, [session?.accessToken, status]);

  // const joinRoom = useCallback((roomId: string) => {
  //   if (socket) {
  //     console.log("Joining room:", roomId);
  //     socket.emit("join_room", roomId);
  //   } else {
  //     console.error("Cannot join room: Socket is not connected");
  //   }
  // }, [socket]);

  // const leaveRoom = useCallback((roomId: string) => {
  //   if (socket) {
  //     console.log("Leaving room:", roomId);
  //     socket.emit("leave_room", roomId);
  //   } else {
  //     console.error("Cannot leave room: Socket is not connected");
  //   }
  // }, [socket]);

  // const sendRoomMessage = useCallback((roomId: string, content: string) => {
  //   if (socket) {
  //     console.log("Sending message to room:", roomId, "Content:", content);
  //     socket.emit("room_message", JSON.stringify({ roomId, content }));
  //   } else {
  //     console.error("Cannot send message: Socket is not connected");
  //   }
  // }, [socket]);

  const value = {
    socket,
    isConnected,
    onlineUsers,
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};