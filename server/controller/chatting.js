export default class ChattingController {
  constructor(chattingRepository) {
    this.chatting = chattingRepository;
  }

  /* 채팅 목록 가져오기 */
  getChattings = async (req, res) => {
    try {
      const username = req.username;
      const { id, user } = req.query;
      const socketId = id;
      const chattingUser = user;
      let result;
      let chatList = [];

      if (chattingUser === "master") {
        await this.testInitSocket("master", socketId);
      } else {
        await this.testInitSocket(username, socketId);
      }

      if (!username && !id) {
        return res.status(200).json({ username, chatList });
      }

      if (chattingUser === "master") {
        // master(admin)
        result = await this.chatting.getAllChattings(); //전체가져오기
      } else {
        // customer
        if (!username) {
          result = await this.chatting.getChattings(id);
        } else {
          result = await this.chatting.getChattings(username);
        }
      }

      if (result.length === 0) {
        return res.status(200).json({ username, chatList });
      }

      for (let i = 0; i < result.length; i++) {
        const notReadMsg = await this.chatting.getNoReadMessage(
          result[i].room_name,
          chattingUser
        );

        if (notReadMsg.number) {
          result[i].noReadMsg = notReadMsg.number;
        }
        chatList.push(result[i]);
      }

      res.status(200).json({ username, chatList });
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 새로운 채팅 생성 */
  joinRoom = async (req, res) => {
    try {
      let member;
      let { username, socketId } = req.body;

      if (!socketId) {
        return res.sendStatus(400)
      }

      username ? (member = 1) : (member = 0);

      const roomname = await this.createChatting(username || socketId, member);

      if (!roomname) {
        return res.sendStatus(400);
      }
      
      res.status(200).json({ roomname });
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 고객이 채팅 삭제 (실제 삭제x, admin에서 확인 가능) */
  setDisabledChatting = async (req, res) => {
    try {
      const roomname = req.params.id;

      await this.chatting.setDisabledChatting(roomname);

      res.sendStatus(204);
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 실제 채팅 삭제 */
  deleteChatting = async (req, res) => {
    try {
      const roomname = req.params.id;

      await this.chatting.deleteChatting(roomname);

      res.sendStatus(204);
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  getNewMessage = async (req, res) => {
    try {
      const username = req.username;
      const roomname = req.params.id;
      let { user } = req.query;
      const chattingUser = user;

      const chatting = await this.chatting.getNewChatting(
        roomname,
        chattingUser
      );

      await this.chatting.updateNewChatting(roomname, chatting.chatting_id);

      return res.status(200).json({ username, newChatting: chatting });

    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  }
  /* 채팅 내용 가져오기 */
  getMessages = async (req, res) => {
    try {
      const username = req.username;
      const roomname = req.params.id;
      const amountOfSendData = 20; // 한번에 보낼 데이터의 양
      let { page, user } = req.query;
      const chattingUser = user;

      if (isNaN(Number(page))) return res.sendStatus(404);

      let prevPage = (page - 1) * amountOfSendData;
      let hasmore = true;

      const chatting = await this.chatting.getChatting(
        roomname,
        prevPage,
        amountOfSendData
      );

      if (chatting.length < 1) {
        hasmore = false;
      }
      const reverse = chatting.reverse();

      await this.chatting.readAllMsg(roomname, chattingUser);

      return res
        .status(200)
        .json({ username, newChatting: reverse, hasmore });

    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  deleteExpiredChatting = async (socketId) => {
    try {
      this.chatting.deleteExpiredChatting(socketId);
    } catch (error) {
      console.log(error);
    }
  };

  testInitSocket = async (username, socketId) => {
    if (username) {
      const user = await this.chatting.getPlayer(username);

      if (user) {
        this.chatting.updateSocketId(socketId, username);
      } else {
        this.chatting.recordNewPlayer(username, socketId);
      }
    } else {
      const user = await this.chatting.getPlayer(socketId);

      if (!user) {
        this.chatting.recordNewPlayer(socketId, socketId);
      }
    }

    return;
  };

  createChatting = async (username, member) => {
    let chatListId;

    try {
      chatListId = await this.chatting.insertInChattingList(username, member);
      const room_name = `chat${chatListId}`;
      const result = await this.chatting.createchattingRoom(
        room_name,
        chatListId
      );

      if (!result) {
        await this.chatting.cancelChattingList(chatListId);
        return false;
      }

      this.chatting.recordRoomnameAndPlayer(room_name, "master");
      this.chatting.recordRoomnameAndPlayer(room_name, username);

      return room_name;
    } catch (error) {
      if (chatListId) {
        await this.chatting.cancelChattingList(chatListId);
      }
      console.log(error);
      return false;
    }
  };

  sendMessage = async (req, res) => {
    try {
      const username = req.username;
      const roomname = req.params.id;
      const { uniqueId, message, readAMsg, socketId, chattingUser } = req.body;

      if (!roomname) {
        return res.status(400).json({ code: "" });
      }

      const date = new Date();

      const chattingId = await this.chatting.saveChatting(
        uniqueId,
        message,
        roomname,
        chattingUser,
        readAMsg,
        date
      );

      if (!chattingId) {
        return res.sendStatus(400);
      }

      const chatting = await this.chatting.getNewChattingById(
        roomname,
        chattingId
      );

      //chatting에 참여하고 있는 player 리스트 받아오기
      const playerList = await this.chatting.getPlayersSocketId(
        roomname,
        socketId
      );

      res
        .status(200)
        .json({ user: username, newChatting: chatting, playerList });
    } catch (error) {
      console.log(error);
      res.sendStatus(400);
    }
  };
}
