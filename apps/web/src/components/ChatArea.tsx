"use client"

import React, { useState } from "react"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import { ScrollArea } from "@repo/ui/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar"
import { Send } from "lucide-react"

interface ChatAreaProps {
  selectedRoom: { id: number; name: string }
  messages: { id: number; sender: string; content: string }[]
}

export default function ChatArea({ selectedRoom, messages }: ChatAreaProps) {
  const [messageInput, setMessageInput] = useState("")

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    // Logic to send a message would go here
    console.log("Sending message:", messageInput)
    setMessageInput("")
  }

  return (
    <div className="flex-1 flex flex-col">
      <header className="bg-white border-b p-4">
        <h2 className="text-xl font-bold">{selectedRoom.name}</h2>
      </header>
      <ScrollArea className="flex-1 p-4">
        {messages.map((message) => (
          <div key={message.id} className="flex items-start mb-4">
            <Avatar className="mr-2">
              <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${message.sender}`} />
              <AvatarFallback>{message.sender[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{message.sender}</p>
              <p>{message.content}</p>
            </div>
          </div>
        ))}
      </ScrollArea>
      <footer className="bg-white border-t p-4">
        <form onSubmit={handleSendMessage} className="flex">
          <Input
            className="flex-1 mr-2"
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
          />
          <Button type="submit">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </footer>
    </div>
  )
}
