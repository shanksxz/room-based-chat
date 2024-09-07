"use client"

import React, { useState } from "react"
import Sidebar from "./SideBar"
import ChatArea from "./ChatArea"

const rooms = [
  { id: 1, name: "General", createdBy: "user" },
  { id: 2, name: "Random", createdBy: "other" },
  { id: 3, name: "Tech Talk", createdBy: "user" },
  { id: 4, name: "Music", createdBy: "other" },
]

const messages = [
  { id: 1, sender: "Alice", content: "Hey everyone!" },
  { id: 2, sender: "Bob", content: "Hi Alice, how are you?" },
  { id: 3, sender: "Charlie", content: "Hello folks!" },
]

export default function ChatApp() {
  const [selectedRoom, setSelectedRoom] = useState(rooms[0])

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar rooms={rooms} onSelectRoom={setSelectedRoom} />
      <ChatArea selectedRoom={selectedRoom} messages={messages} />
    </div>
  )
}
