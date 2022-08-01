import { Server } from "socket.io";
import { deleteChatting } from "../controller/chatting.js";

class Socket {
  constructor(server, clientUrl) {
    this.io = new Server(server, {
      cors: {
        origin: clientUrl,
      },
    });

    this.io.on("connection", (socket) => {
      this.socket = socket;

      socket.on("joinRoom", (roomname) => {
        socket.join(roomname);
        socket.emit("newMessage");
        socket.broadcast.to(roomname).emit("joinCheck", roomname);
      });

      socket.on("newChatting", (roomname) => {
        socket.broadcast.to(roomname).emit("receiveMessage");
        this.io.emit("newMessage");
      });

      socket.on("couple", (roomname) => {
        this.io.in(roomname).emit("couple");
        socket.broadcast.to(roomname).emit("couple");
      });

      socket.on("leaveRoom", (roomname) => {
        socket.leave(roomname);
        socket.broadcast.to(roomname).emit("leave");
      });

      socket.on("disconnect", () => {
        deleteChatting(socket.id);
      });
    });
  }

  async socketError() {
    this.socket.emit("joinError");
  }
}

let socket;

/* socket 생성 */
export default function initSocket(server, app) {
  if (!socket) {
    socket = new Socket(server, app);
  }
}
