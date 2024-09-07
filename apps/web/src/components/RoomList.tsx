"use client"

import React from "react"
import { Button } from "@repo/ui/components/ui/button"
import { ScrollArea } from "@repo/ui/components/ui/scroll-area"

interface RoomListProps {
  rooms: { id: number; name: string; createdBy: string }[]
  onSelectRoom: (room: { id: number; name: string; createdBy: string }) => void
}

export default function RoomList({ rooms, onSelectRoom }: RoomListProps) {
  return (
    <ScrollArea className="h-[300px]">
      {rooms.map((room) => (
        <Button
          key={room.id}
          variant="ghost"
          className="w-full justify-start mb-1"
          onClick={() => onSelectRoom(room)}
        >
          # {room.name}
        </Button>
      ))}
    </ScrollArea>
  )
}
