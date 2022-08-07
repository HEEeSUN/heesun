import { io } from "socket.io-client";
import { AdminChattingService } from "../model/chatting.model";

type SocketEvent = "receiveMessage" | "messageSave" | "updateChatList" | "";

class SocketService {
  socket: any;
  baseUrl: string | undefined;
  callback: (socketEventData: SocketEvent) => void;
  setSocketId: (socketId: string) => Promise<void>;
  chattingService: AdminChattingService;

  constructor(
    callback: (socketEventData: SocketEvent) => void,
    setInitialSocketId: (socketId: string) => Promise<void>,
    chattingService: AdminChattingService
  ) {
    this.baseUrl = process.env.REACT_APP_BASE_URL;
    if (this.baseUrl) {
      this.socket = io(this.baseUrl, {
        reconnectionAttempts: 5,
      });
    }
    this.callback = callback;
    this.setSocketId = setInitialSocketId;
    this.chattingService = chattingService;

    this.socket.on("connect", async () => {
      console.log(this.socket.id); //
      await this.setSocketId(this.socket.id);
    });

    this.socket.on("messageSave", () => {
      callback("messageSave");
    });

    this.socket.on("updateChatList", () => {
      callback("updateChatList");
    });

    this.socket.on("receiveMessage", () => {
      callback("receiveMessage");
    });

    this.socket.on("joinCheck", (roomname: string) => {
      this.socket.emit("couple", roomname);
    });

    this.socket.on("couple", (roomname: string) => {});
  }

  async joinRoom(roomname: string) {
    console.log(roomname);
    this.socket.emit("joinRoom", roomname);
  }

  async getChatting(roomname: string, pageNumber: number) {
    const result = await this.chattingService.getChatting(roomname, pageNumber);
    const { newChatting, hasmore } = result;
    return { newChatting, hasmore };
  }

  async getNewChatting(roomname: string) {
    const result = await this.chattingService.getNewChatting(roomname);
    const { newChatting } = result;
    return { newChatting };
  }

  async leaveRoom(roomname: string) {
    this.socket.emit("leaveRoom", roomname);
  }

  async sendMessage(
    uniqueId: string,
    chat: string,
    roomname: string,
    master: boolean,
  ) {
    // await this.chattingService.sendMessage(uniqueId, chat, roomname, master);

    const { newChatting, playerList } = await this.chattingService.sendMessage(
      uniqueId,
      chat,
      roomname,
      master,
      this.socket.id
    );

    this.socket.emit("newChatting", roomname, playerList);

    return { newChatting };
  }
}

let socket: any;

export const initSocket = async (
  callback: (socketEventData: SocketEvent) => void,
  setInitialSocketId: (socketId: string) => Promise<void>,
  chattingService: AdminChattingService
):Promise<void> => {
  socket = new SocketService(callback, setInitialSocketId, chattingService);
};

export const joinRoom = async (roomname: string) => {
  return socket.joinRoom(roomname);
};

export const leaveRoom = async (roomname: string) => {
  return socket.leaveRoom(roomname);
};

export const sendMessage = async (
  uniqueId: string,
  chat: string,
  roomname: string,
  master: boolean
) => {
  return socket.sendMessage(uniqueId, chat, roomname, master);
};

export const getChatting = async (roomname: string, pageNumber: number) => {
  return socket.getChatting(roomname, pageNumber);
};

export const getNewChatting = async (roomname: string) => {
  return socket.getNewChatting(roomname);
};
