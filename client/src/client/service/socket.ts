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
      callback("joinError");
    });
  }

  async leaveRoom() {
    this.socket.emit("leaveRoom", this.roomname);
  }

  async joinRoom(roomname: string) {
    this.roomname = roomname;
    this.socket.emit("joinRoom", roomname);
  }

  async createRoom(socketId: string) {
    try {
      const { roomname } = await this.chattingService.createRoom(socketId);

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

  async sendMessage(
    uniqueId: string,
    text: string,
    masterLeaveOrNot: boolean,
    socketId: string,
    chattingUser: string
  ) {
    try {
      const { newChatting, user, playerList } =
        await this.chattingService.sendMessage(
          uniqueId,
          text,
          this.roomname,
          masterLeaveOrNot,
          socketId,
          chattingUser
        );

      this.socket.emit("newChatting", this.roomname, playerList);

      return { newChatting, user };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getMessage(pageNumber: number, chattingUser: string) {
    try {
      const result = await this.chattingService.getMessage(
        this.roomname,
        pageNumber,
        chattingUser
      );
      // const { username, newChatting, hasmore } = result;
      return result;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getNewMessage(chattingUser: string) {
    try {
      const result = await this.chattingService.getNewMessage(
        this.roomname,
        chattingUser
      );
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
  socketId: string,
  roomname: string = ""
) => {
  if (roomname) {
    socket.joinRoom(roomname);
  } else {
    await socket.createRoom(socketId);
    return;
  }
};

export const sendMessage = async (
  uniqueId: string,
  text: string,
  masterLeaveOrNot: boolean,
  socketId: string,
  chattingUser: string
) => {
  return socket.sendMessage(
    uniqueId,
    text,
    masterLeaveOrNot,
    socketId,
    chattingUser
  );
};

export const getMessage = async (pageNumber: number, chattingUser: string) => {
  return socket.getMessage(pageNumber, chattingUser);
};

export const getNewMessage = async (chattingUser: string) => {
  return socket.getNewMessage(chattingUser);
};

export const leaveRoom = async () => {
  return socket.leaveRoom();
};
