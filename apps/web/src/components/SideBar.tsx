"use client"

import { useEffect, useState } from 'react'
import { Button } from "@repo/ui/components/ui/button"
import { ScrollArea } from "@repo/ui/components/ui/scroll-area"
import { Input } from "@repo/ui/components/ui/input"
import { Avatar, AvatarFallback } from "@repo/ui/components/ui/avatar"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@repo/ui/components/ui/dropdown-menu"
import { Hash, Search, MoreVertical, LogOut, Settings, HelpCircle } from "lucide-react"
import { getUsersRoom } from '@/actions/rooms'
import { useSession, signOut } from 'next-auth/react'
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
    })()
  }, [session])

  const changeRoom = (roomId: string) => {
    router.push(`/room/${roomId}`)
  }

  const filteredRooms = chatRooms && chatRooms.filter(room => 
    room.roomName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  
  return (
    <div className="w-80 h-screen bg-gradient-to-b from-pink-50 to-white flex flex-col border-r border-gray-200">
      <div className="p-4 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{session?.user?.username.charAt(0).toUpperCase() || 'F'}</AvatarFallback>
          </Avatar>
          <span className="font-semibold text-sm">{session?.user?.username || 'Your Name'}</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Help</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="px-4 py-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search"
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="flex-1 px-2">
        {filteredRooms && filteredRooms.map((room) => (
          <Button
            key={room.roomId}
            variant="ghost"
            className="w-full justify-start py-2 px-2 text-left mb-1"
            onClick={() => changeRoom(room.roomId)}
          >
            <Hash className="mr-2 h-4 w-4" />
            <span className="flex-1 text-sm font-medium">{room.roomName}</span>
          </Button>
        ))}
      </ScrollArea>
    </div>
  )
}
