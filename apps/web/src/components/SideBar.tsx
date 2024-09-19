"use client"

import { useEffect, useState } from 'react'
import { Button } from "@repo/ui/components/ui/button"
import { ScrollArea } from "@repo/ui/components/ui/scroll-area"
import { Input } from "@repo/ui/components/ui/input"
import { Hash, Search } from "lucide-react"
import { getUsersRoom } from '@/actions/rooms'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface userRoomType {
  userId: string;
  roomId: string;
  joinedAt: Date;
  roomName: string;
}

export default function SideBar() {
  const [chatRooms, setChatRooms] = useState<userRoomType[] | []>([])
  const [searchTerm, setSearchTerm] = useState("")
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const res = await getUsersRoom({ userId: session?.user.userId! })
      if(res.rooms?.length === 0) {
        return;
      }
      setChatRooms(res.rooms!)
      console.log(res)
    })()
  }, [session])

  const changeRoom = (roomId: string) => {
    router.push(`/room/${roomId}`)
  }


  return (
    <div className="bg-white text-black h-screen w-64 flex flex-col border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold mb-4">Chat Rooms</h2>
        <div className="relative mb-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search rooms"
            className="pl-8 bg-white text-black border-gray-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="flex-1 px-4 py-2">
        {chatRooms && 
          chatRooms.map((room) => (
            <Button
              onClick={() => changeRoom(room.roomId)} 
              key={room.roomId} 
              variant="ghost" 
              className="w-full justify-start mb-1 text-black hover:bg-gray-100"
            >
              <Hash className="mr-2 h-4 w-4" />
              {room.roomName}
            </Button>
          ))
        }
      </ScrollArea>
    </div>
  )
}