"use client";

import useRoom, { MessageType } from "@/zustand/useRoom"
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function useSendMessages() {

    const { selectedRoom, setMessages, messages } = useRoom();
    const [loading, setLoading] = useState(false);
    const { data : session } = useSession();

    const senMessage = async (msg: MessageType) => {
        if(!selectedRoom) return;
        if(!session?.accessToken) return;
        setLoading(true);
        
        try {
            const res = await fetch("http://localhost:8787/messages",{
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${session.accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(msg)
            });    

            if(!res.ok){
                throw new Error("Failed to send message");
            }

            //? no need ig
            const data = await res.json();
            setMessages([...messages, msg]);
        } catch (error) {
            console.error("Failed to send message", error);
        } finally {
            setLoading(false);
        }
    }

    return { senMessage, loading };
}

