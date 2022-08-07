export default class ChattingController {
  constructor(chattingRepository) {
    this.chatting = chattingRepository;
  }

  /* 채팅 목록 가져오기 */
  getChattings = async (req, res) => {
    try {
      const username = req.username;
      const { id } = req.query;
      let result;

      await this.testInitSocket(username, id);

      if (!username && !id) {
        return res.status(200).json({ username, chatList: [] });
      }

      if (!id) {
        result = await this.chatting.getChattings(username);
      } else {
        result = await this.chatting.getChattings(id);
      }

      if (result.length === 0) {
        return res.status(200).json({ username, chatList: [] });
      }

      res.status(200).json({ username, chatList: result });
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

      username ? (member = 1) : (member = 0);

      const roomname = await this.testCreateChatting(username || socketId, member);
      // const roomname = await this.createChat(username || socketId, member);

      res.status(200).json({ roomname });
    } catch (error) {
      console.log(error);
    }
  };

  /* 새로운 채팅 생성 */
  createChat = async (username, member) => {
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

      return room_name;
    } catch (error) {
      if (chatListId) {
        await this.chatting.cancelChattingList(chatListId);
      }
      console.log(error);
      return false;
    }
  };

  /* 고객이 채팅 삭제 (실제 삭제x, admin에서 확인 가능) */
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

  /* 채팅 내용 가져오기 */
  getMessage = async (req, res) => {
    try {
      const username = req.username;
      const roomname = req.params.id;
      const amountOfSendData = 20; // 한번에 보낼 데이터의 양
      let { page } = req.query;

      if (!page) {
        const chatting = await this.chatting.getNewChatting(roomname);

        await this.chatting.updateNewChatting(roomname, chatting.chatting_id);

        return res.status(200).json({ username, newChatting: chatting });
      } else {
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

        return res
          .status(200)
          .json({ username, newChatting: reverse, hasmore });
      }
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 채팅 저장 */
  sendMessage = async (req, res) => {
    try {
      const username = req.username;
      const roomname = req.params.id;
      const { uniqueId, message, readAMsg } = req.body;

      if (!roomname) {
        return res.status(400).json({ code: "" });
      }

      const date = new Date();

      const chattingId = await this.chatting.saveChatting(
        uniqueId,
        message,
        roomname,
        "client",
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

      res.status(200).json({ user: username, newChatting: chatting });
    } catch (error) {
      console.log(error);
      res.sendStatus(400);
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
    let user;

    if (username) {
      user = await this.chatting.getPlayer(username);

      if (user) {
        this.chatting.updateSocketId(socketId, username)
      } else {
        this.chatting.recordNewPlayer(username, socketId)
      }
    } else {
      user = await this.chatting.getPlayer(socketId);
      
      if (!user) {
        this.chatting.recordNewPlayer(socketId, socketId)
      }
    }
  }

  testCreateChatting = async (username, member) => {
    try {
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

        this.chatting.recordRoomnameAndPlayer(room_name, 'master')
        this.chatting.recordRoomnameAndPlayer(room_name, username)
  
        return room_name;
      } catch (error) {
        if (chatListId) {
          await this.chatting.cancelChattingList(chatListId);
        }
        console.log(error);
        return false;
      }
    } catch (error) {
      console.log(error);
    }
  }

  testSendMessage = async (req, res) => {
    try {
      const username = req.username;
      const roomname = req.params.id;
      const { uniqueId, message, readAMsg, socketId } = req.body;

      if (!roomname) {
        return res.status(400).json({ code: "" });
      }

      const date = new Date();

      const chattingId = await this.chatting.saveChatting(
        uniqueId,
        message,
        roomname,
        "client",
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
      const playerList = await this.chatting.getPlayersSocketId(roomname, socketId);

      res.status(200).json({ user: username, newChatting: chatting, playerList });
    } catch (error) {
      console.log(error);
      res.sendStatus(400);
    }
  };
}
