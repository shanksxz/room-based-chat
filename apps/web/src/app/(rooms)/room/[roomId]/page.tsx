import { getMessages, getRoomName } from "@/actions/rooms";
import Chat from "@/components/Chat";
import { auth } from "@/server/auth";
import { notFound } from 'next/navigation';

export default async function Page({ params }: {
    params: {
        roomId: string
    }
}) {
    const session = await auth();
    
    if (!session || !session.user.userId) {
        return <h1>Please log in to view this chat</h1>;
    }

    const { status, message, messages } = await getMessages({ 
        roomId: params.roomId, 
        userId: session.user.userId 
    });

    
    if (status !== 200) {
        if (status === 404) {
            return notFound();
        }
        return <h1>{message || 'An error occurred'}</h1>;
    }
    
    return (
        <Chat
            roomId={params.roomId} 
            initialMessages={messages} 
            userId={session.user.userId!}
        />
    );
}
