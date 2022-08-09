import { Server } from "socket.io";

class Socket {
  constructor(server, clientUrl, deleteChatting) {
    this.deleteChatting = deleteChatting;
    this.io = new Server(server, {
      cors: {
        origin: clientUrl,
      },
    });

    this.io.on("connection", (socket) => {
      this.socket = socket;

      socket.on("joinRoom", (roomname) => {
        socket.join(roomname);
        socket.broadcast.to(roomname).emit("joinCheck", roomname);
      });

      socket.on("newChatting", (roomname, playerList) => {
        socket.broadcast.to(roomname).emit("receiveMessage");

        for(let i=0; i<playerList.length; i++) {
          socket.broadcast.to(playerList[i].socketId).emit('updateChatList');        
        }
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
        this.deleteChatting(socket.id);
      });
    });
  }

  async socketError() {
    this.socket.emit("joinError");
  }
}

let socket;

/* socket 생성 */
export default function initSocket(server, clientUrl, deleteChatting) {
  if (!socket) {
    socket = new Socket(server, clientUrl, deleteChatting);
  }
}
