import { create } from "zustand"

export interface MessageType {
    roomId : string;
    userId : string;
    content : string;
    sentAt : Date;
}

export interface RoomType {
    roomId : string;
    roomName : string;
    createdBy : string;
}

interface CurrRoomState {
    selectedRoom : RoomType | null;
    messages : MessageType[];
    setSelectedRoom : (room : RoomType) => void;
    setMessages: (msg : MessageType[]) => void;
}

const useRoom = create<CurrRoomState>((set) => ({
    selectedRoom : null,
    messages : [],
    setSelectedRoom : (room) => set({ selectedRoom : room }),
    //? might not need to handle previous messages
    // setMessages : (msg) => set((state) => ({ messages : [...state.messages, msg] }))
    setMessages : (msg) => set({ messages : msg })
}));

export default useRoom;



