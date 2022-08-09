import { io } from "socket.io-client";
import { ChattingService } from "../model/chatting.model";

class Socket {
  socket: any;
  baseUrl: string | undefined;
  setSocketId: (id: string) => void;
  callback: (eventData: string) => void;
  chattingService: ChattingService;
  roomname: string;

  constructor(
    chattingService: ChattingService,
    setSocketId: (id: string) => void,
    callback: (eventData: string) => void
  ) {
    this.baseUrl = process.env.REACT_APP_BASE_URL;
    if (this.baseUrl) {
      this.socket = io(this.baseUrl, {
        reconnectionAttempts: 5,
      });
    }
    this.chattingService = chattingService;
    this.roomname = "";
    this.callback = callback;
    this.setSocketId = setSocketId;

    this.socket.on("connect", () => {
      setSocketId(this.socket.id);
    });

    this.socket.on("messageSave", () => {
      callback("messageSave");
    });

    this.socket.on("receiveMessage", () => {
      callback("receiveMessage");
    });

    this.socket.on("updateChatList", () => {
      callback("updateChatList");
    });

    this.socket.on("joinCheck", (roomname: string) => {
      callback("couple");
      this.socket.emit("couple", roomname);
    });

    this.socket.on("couple", () => {
      callback("couple");
    });

    this.socket.on("leave", () => {
      callback("masterLeave");
    });

    this.socket.on("joinError", () => {
      callback("joinError");
    });

    this.socket.on("disconnect", () => {
      alert("서버와의 연결이 원활하지 않습니다\n잠시후 다시 시도해 주세요");
      callback("joinError");
    });
  }

  async leaveRoom(roomname: string) {
    this.socket.emit("leaveRoom", roomname);
  }

  async joinRoom(roomname: string) {
    this.roomname = roomname;
    this.socket.emit("joinRoom", roomname);
  }

  async createRoom(username: string, socketId: string) {
    try {
      const { roomname } = await this.chattingService.createRoom(
        username,
        socketId
      );

      if (roomname) {
        this.roomname = roomname;
        this.socket.emit("joinRoom", roomname);
      } else {
        this.callback("joinError");
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async sendMessage(uniqueId: string, text: string, masterLeaveOrNot: boolean, socketId: string) {
    try {
      const { newChatting, user, playerList } = await this.chattingService.sendMessage(
        uniqueId,
        text,
        this.roomname,
        masterLeaveOrNot,
        socketId
      );

      this.socket.emit("newChatting", this.roomname, playerList);

      return { newChatting, user };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getMessage(pageNumber: number) {
    try {
      const result = await this.chattingService.getMessage(
        this.roomname,
        pageNumber
      );
      // const { username, newChatting, hasmore } = result;
      return result;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getNewMessage() {
    try {
      const result = await this.chattingService.getNewMessage(this.roomname);
      // const { username, newChatting } = result;
      return result;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}

let socket: any;

export const initSocket = async (
  chattingService: ChattingService,
  setSocketId: (id: string) => void,
  callback: (eventData: string) => void
) => {
  if (!socket) {
    socket = new Socket(chattingService, setSocketId, callback);
  } else {
    socket = "";
    socket = new Socket(chattingService, setSocketId, callback);
  }
};

export const joinRoom = async (
  username: string,
  socketId: string,
  roomname: string = ""
) => {
  if (roomname) {
    socket.joinRoom(roomname);
  } else {
    await socket.createRoom(username, socketId);
    return;
  }
};

export const sendMessage = async (
  uniqueId: string,
  text: string,
  masterLeaveOrNot: boolean,
  socketId: string,
) => {
  return socket.sendMessage(uniqueId, text, masterLeaveOrNot, socketId);
};

export const getMessage = async (pageNumber: number) => {
  return socket.getMessage(pageNumber);
};

export const getNewMessage = async () => {
  return socket.getNewMessage();
};

export const leaveRoom = async (roomname: string) => {
  return socket.leaveRoom(roomname);
};
