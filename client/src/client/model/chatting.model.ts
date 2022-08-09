export type ChattingService = {
  getChattings: (
    socketId: string,
    chattingUser: string
  ) => Promise<{ username: string; chatList: Chat[] }>;
  deleteChatting: (roomname: string) => Promise<void>;
  createRoom: (
    username: string,
    socketId: string
  ) => Promise<{ roomname: string }>;
  sendMessage: (
    uniqueId: string,
    text: string,
    roomname: string,
    masterLeaveOrNot: boolean,
    socketId: string,
    chattingUser: string
  ) => Promise<{
    user: string | undefined;
    newChatting: TempChattingCheck[];
    playerList: PlayerList[];
  }>;
  getMessage: (
    roomname: string,
    pageNumber: number,
    chattingUser: string
  ) => Promise<{
    result: {
      username: string | undefined;
      newChatting: TempChatting[] | [];
      hasmore: boolean;
    };
  }>;
  getNewMessage: (
    roomname: string,
    chattingUser: string
  ) => Promise<{
    username: string | undefined;
    newChatting: TempChattingCheck;
  }>;
  getMyMessage: (roomname: string) => Promise<{
    username: string | undefined;
    newChatting: TempChattingCheck;
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
};

export type TempChatting = {
  text?: string;
  username?: string;
  date?: string;
  createdAt: string;
  uniqueId?: string;
};

export type TempChattingCheck = {
  uniqueId: string;
  text: string;
  username: string;
  createdAt: string;
};

type PlayerList = {
  socketId: string;
};
