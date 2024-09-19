"use client"

// import useRoom from "@/zustand/useRoom";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function useGetRooms() {
    const [loading, setLoading] = useState(true);
    const [rooms, setRooms] = useState([]);
    const { data: session } = useSession();

    useEffect(() => {
        const getRooms = async () => {
            if (!session?.accessToken) return;
            setLoading(true);

            try {
                const res = await fetch("http://localhost:8787/rooms", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${session.accessToken}`,
                        "Content-Type": "application/json",
                    }
                });

                if (!res.ok) {
                    throw new Error("Failed to get rooms");
                }

                const data = await res.json();
                setRooms(data.rooms);
            } catch (error) {
                console.error("Failed to get rooms", error);
            } finally {
                setLoading(false);
            }
        }
        getRooms();
    }, [session]);

    return { rooms, loading };
}