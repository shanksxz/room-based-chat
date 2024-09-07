"use client"

import React, { useState } from "react"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@repo/ui/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs"
import { PlusCircle } from "lucide-react"
import RoomList from "./RoomList"

interface SidebarProps {
  rooms: { id: number; name: string; createdBy: string }[]
  onSelectRoom: (room: { id: number; name: string; createdBy: string }) => void
}

export default function Sidebar({ rooms, onSelectRoom }: SidebarProps) {
  const [newRoomName, setNewRoomName] = useState("")

  const handleCreateRoom = () => {
    console.log("Creating room:", newRoomName)
    setNewRoomName("")
  }

  return (
    <div className="w-64 bg-white border-r">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Chat Rooms</h2>
        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="my">My Rooms</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <RoomList rooms={rooms} onSelectRoom={onSelectRoom} />
          </TabsContent>
          <TabsContent value="my">
            <RoomList
              rooms={rooms.filter((room) => room.createdBy === "user")}
              onSelectRoom={onSelectRoom}
            />
          </TabsContent>
        </Tabs>
      </div>
      <div className="p-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Room
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Room</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="Room name"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
            />
            <Button onClick={handleCreateRoom}>Create</Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
