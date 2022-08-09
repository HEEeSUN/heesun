export type AdminChattingService = {
  getInquiry: (socketId: string) => Promise<{
    chatList: Chat[] | [];
  }>;
  deleteChat: (roomname: string) => Promise<void>;

  getChatting: (
    roomname: string,
    pageNumber: number
  ) => Promise<{
    newChatting: TempChat[] | [];
    hasmore: boolean;
  }>;
  getNewChatting: (roomname: string) => Promise<{
    newChatting: TempChattingCheck;
  }>;
  sendMessage: (
    uniqueId: string,
    chat: string,
    roomname: string,
    master: boolean,
    socketId: string
  ) => Promise<{
    newChatting: TempChattingCheck;
    playerList: PlayerList[];
  }>;
};

export type Chat = {
  chat_id: number;
  room_name: string;
  username: string;
  member: number;
  noReadMsg: number;
  lastChat: string;
  lastChatTime: string;
  chatTime?: string;
  status: boolean;
};

export type TempChat = {
  uniqueId?: string;
  text: string;
  username: string;
  date?: string;
  createdAt: string;
};

export type TempChattingCheck = {
  uniqueId: string;
  text: string;
  username: string;
  createdAt: string;
};

export type SocketEvent = "newMessage" | "receiveMessage" | "messageSave" | "updateChatList" | "couple" | "leave" | "";

type PlayerList = {
  socketId: string
}