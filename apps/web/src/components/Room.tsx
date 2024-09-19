'use client'

import { useState } from 'react'
import { Button } from "@repo/ui/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@repo/ui/components/ui/dialog"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { PlusCircle, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'

export default function Room() {

    const { data: session } = useSession()

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [action, setAction] = useState<'create' | 'join' | null>(null)

    const handleAction = (selectedAction: 'create' | 'join') => {
        setAction(selectedAction)
        setIsDialogOpen(true)
    }

    const createRoom = async (roomName: string) => {
        try {
            const res = await fetch('http://localhost:8787/api/room', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session?.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ roomName })
            });

            if (!res.ok) {
                throw new Error('Error while creating room');
            }

            const data = await res.json();
            toast.success('Room created successfully');
            console.log(data);
        } catch (error) {
            toast.error('Error while creating room');
            console.error("Error while creating room:", error);
        }
    }

    const joinRoom = async (roomId: string) => {
        try {
            const res = await fetch('http://localhost:8787/api/join-room', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session?.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ roomId })
            });

            if (!res.ok) {
                throw new Error('Error while joining room');
            }

            const data = await res.json();
            toast.success('Room joined successfully');
            console.log(data);
        } catch (error) {
            toast.error('Error while joining room');
            console.error("Error while joining room:", error);
        }
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        switch (action) {
            case 'create':
                createRoom(event.currentTarget.roomInput.value);
                break
            case 'join':
                joinRoom(event.currentTarget.roomInput.value);
                break
            default:
                break;
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-8 w-full max-w-md transition-all duration-300 ease-in-out hover:shadow-xl">
                <h1 className="text-3xl font-bold mb-8 text-center text-gray-900">Room Selection</h1>
                <div className="space-y-6">
                    <Button
                        onClick={() => handleAction('create')}
                        className="w-full text-lg py-6 bg-gray-900 hover:bg-gray-800 transition-colors duration-300"
                    >
                        <PlusCircle className="mr-2 h-5 w-5" />
                        Create a Room
                    </Button>
                    <Button
                        onClick={() => handleAction('join')}
                        variant="outline"
                        className="w-full text-lg py-6 border-2 border-gray-900 text-gray-900 hover:bg-gray-100 transition-colors duration-300"
                    >
                        <LogIn className="mr-2 h-5 w-5" />
                        Join a Room
                    </Button>
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px] bg-white border border-gray-200">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-gray-900">
                            {action === 'create' ? 'Create a Room' : 'Join a Room'}
                        </DialogTitle>
                        <DialogDescription className="text-lg text-gray-600">
                            {action === 'create'
                                ? 'Enter a name for your new room.'
                                : 'Enter the room code to join.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="roomInput" className="text-lg font-medium text-gray-900">
                                    {action === 'create' ? 'Room Name' : 'Room Code'}
                                </Label>
                                <Input
                                    id="roomInput"
                                    placeholder={action === 'create' ? 'Enter room name' : 'Enter room code'}
                                    required
                                    className="text-lg py-3 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                                />
                            </div>
                        </div>
                        <DialogFooter className="mt-6">
                            <DialogClose asChild>
                                <Button type="button" variant="outline" className="text-lg py-3 border-2 border-gray-900 text-gray-900 hover:bg-gray-100">Cancel</Button>
                            </DialogClose>
                            <Button type="submit" className="text-lg py-3 px-6 bg-gray-900 hover:bg-gray-800 transition-colors duration-300">
                                {action === 'create' ? 'Create' : 'Join'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}