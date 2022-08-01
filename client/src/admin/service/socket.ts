import { io } from "socket.io-client";
import { AdminChattingService } from "../model/chatting.model";

type SocketEvent = "newMessage" | "receiveMessage" | "messageSave" | "";

class SocketService {
  socket: any;
  callback: (socketEventData: SocketEvent) => void;
  chattingService: AdminChattingService;

  constructor(
    callback: (socketEventData: SocketEvent) => void,
    chattingService: AdminChattingService
  ) {
    this.socket = io("http://localhost:8080", {
      reconnectionAttempts: 5,
    });
    this.callback = callback;
    this.chattingService = chattingService;

    this.socket.on("connect", () => {
      console.log(this.socket.id); //
    });

    this.socket.on("messageSave", () => {
      callback("messageSave");
    });

    this.socket.on("newMessage", () => {
      callback("newMessage");
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
    master: boolean
  ) {
    // await this.chattingService.sendMessage(uniqueId, chat, roomname, master);

    const { newChatting } = await this.chattingService.sendMessage(
      uniqueId,
      chat,
      roomname,
      master
    );
    this.socket.emit("newChatting", roomname);

    return { newChatting };
  }
}

let socket: any;

export const initSocket = (
  callback: (socketEventData: SocketEvent) => void,
  chattingService: AdminChattingService
) => {
  socket = new SocketService(callback, chattingService);

  console.log("init");
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
