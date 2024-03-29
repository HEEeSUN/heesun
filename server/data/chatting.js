export default class ChattingRepository {
  #db;

  constructor(db) {
    this.#db = db;
  }

  checkRoomname = async (roomname) => {
    return this.#db
      .execute(`SELECT EXISTS (
                  SELECT * 
                  FROM chat_list 
                  WHERE room_name=?
                ) as existence`, [roomname])
      .then((result) => result[0].existence)
  }

  insertInChattingList = async (username, member) => {
    return this.#db
      .execute(`INSERT INTO chat_list (username, member) VALUES (?, ?)`, [
        username,
        member,
      ])
      .then((result) => result[0].insertId);
  };

  createchattingRoom = async (roomname, id) => {
    let conn;

    try {
      conn = await this.#db.getConnection();
      await conn.beginTransaction();

      const query1 = conn.execute(
        `UPDATE chat_list SET room_name=?, status=true WHERE chat_id=?`,[
          roomname, 
          id
        ]);

      const query2 = conn.execute(
        `CREATE TABLE ${this.#db.escapeId(roomname)} (
          chatting_id INT NOT NULL AUTO_INCREMENT,
          uniqueId CHAR(7) NULL,
          text TEXT NULL,
          createdAt CHAR(19) NULL,
          username VARCHAR(50) NOT NULL,
          readAMsg TINYINT NULL,
          UNIQUE INDEX chatting_id_UNIQUE (chatting_id ASC) VISIBLE,
          PRIMARY KEY (chatting_id))`);

      await Promise.all([query1, query2]);

      await conn.commit();
      return true;
    } catch (error) {
      await conn.rollback();
      throw new Error(error);
    } finally {
      conn.release();
    }
  };

  cancelChattingList = async (id) => {
    return this.#db
      .execute(`DELETE FROM chat_list WHERE chat_id=?`, [id])
      .then((result) => result[0]);
  };

  getChattings = async (username) => {
    return this.#db
      .execute(`SELECT * 
                FROM chat_list 
                WHERE username=? AND status IS NOT false
                ORDER BY lastChatTime DESC`, [username])
      .then((result) => result[0]);
  };

  getChatting = async (roomname, prevPage, amountOfSendData) => {
    return this.#db
      .execute(`SELECT uniqueId, text, createdAt, username 
                FROM ${this.#db.escapeId(roomname)}
                ORDER BY chatting_id DESC
                LIMIT ${amountOfSendData} OFFSET ${prevPage}`)
      .then((result) => result[0]);
  };

  setDisabledChatting = async (roomname) => {
    return this.#db
      .execute(`UPDATE chat_list SET status=false WHERE room_name = ?`, [
        roomname,
      ])
      .then((result) => result[0]);
  };

  deleteChatting = async (roomname) => {
    let conn;

    try {
      conn = await this.#db.getConnection();
      await conn.beginTransaction();

      const query1 = conn.execute(
        `DELETE FROM chat_list WHERE room_name=?`, [
        roomname,
      ]);

      const query2 = conn.execute(
        `DROP TABLE IF EXISTS ${this.#db.escapeId(roomname)}`
      );

      await Promise.all([query1, query2]);

      await conn.commit();
      return;
    } catch (error) {
      await conn.rollback();
      throw new Error(error);
    } finally {
      conn.release();
    }
  };

  getNewChatting = async (roomname, chattingUser) => {
    return this.#db
      .execute(`SELECT chatting_id, uniqueId, text, createdAt, username 
                FROM ${this.#db.escapeId(roomname)}
                WHERE uniqueId IS NOT NULL AND username!=?
                ORDER BY chatting_id DESC`,[chattingUser])
      .then((result) => result[0][0]);
  };

  getNewChattingById = async (roomname, id) => {
    return this.#db
      .execute(`SELECT uniqueId, text, createdAt, username 
                FROM ${this.#db.escapeId(roomname)}
                WHERE chatting_id=?`, [id])
      .then((result) => result[0][0]);
  };

  updateNewChatting = async (roomname, chatting_id) => {
    return this.#db
      .execute(`UPDATE ${this.#db.escapeId(roomname)} SET uniqueId=null WHERE chatting_id=?`, [
        chatting_id
      ]);
  };

  saveChatting = async (uniqueId, message, roomname, chattingUser, readAMsg, date) => {
    let conn;

    try {
      conn = await this.#db.getConnection();
      await conn.beginTransaction();

      const query1 = conn.execute(
        `INSERT INTO ${this.#db.escapeId(roomname)} (uniqueId, text, username, readAMsg, createdAt) VALUES (?, ?, ?, ?, ?)`, [
          uniqueId, 
          message, 
          chattingUser, 
          readAMsg, 
          date
        ]);

      const query2 = conn.execute(
        `UPDATE chat_list SET lastChat=?, lastChatTime=? WHERE room_name=?`, [
          message, 
          date, 
          roomname
        ]);

      const results = await Promise.all([query1, query2]);

      await conn.commit();
      return results[0][0].insertId;
    } catch (error) {
      await conn.rollback();
      throw new Error(error);
    } finally {
      conn.release();
    }
  };

  deleteExpiredChatting= async (socketId) => {
    return this.#db
      .execute(`UPDATE chat_list SET status=false WHERE member=false AND username = ?`, [
        socketId
      ]);
  };

  getPlayer = async (username) => {
    return this.#db
      .execute(`SELECT * 
                FROM socket_id_list 
                WHERE username=?`,[username])
      .then((result) => result[0][0]);
  }

  updateSocketId = async (socketId, username) => {
    return this.#db
      .execute(`UPDATE socket_id_list SET socketId=? WHERE username=?`,[socketId, username])
  }

  recordNewPlayer = async (username, socketId) => {
    return this.#db
      .execute(`INSERT INTO socket_id_list (username, socketId) VALUES (?, ?)`, [
        username,
        socketId,
      ])
      .then((result) => result[0].insertId);
  }

  recordRoomnameAndPlayer = async (roomname, username) => {
    return this.#db
      .execute(`INSERT INTO chatting_roomname_list (roomname, player) VALUES (?, ?)`, [
        roomname,
        username,
      ])
      .then((result) => result[0].insertId);
  }

  getPlayersSocketId = async (roomname, socketId) => {
    return this.#db
      .execute(`SELECT socketId 
                FROM chatting_roomname_list JOIN socket_id_list 
                ON chatting_roomname_list.player = socket_id_list.username 
                WHERE roomname=? AND socketId != ?`,[roomname, socketId])
      .then((result) => result[0]);
  }

  getNoReadMessage = async (roomname, chattingUser) => {
    return this.#db
      .execute(`SELECT COUNT(*) AS number 
                FROM ${this.#db.escapeId(roomname)} 
                WHERE uniqueId IS NOT null AND username!=?`,[chattingUser])
      .then((result) => result[0][0]);
  };

  readAllMsg = async (roomname, chattingUser) => {
    return this.#db
      .execute(`UPDATE ${this.#db.escapeId(roomname)} SET uniqueId=null WHERE username!=?`,[chattingUser]);
  };

  getAllChattings = async () => {
    return this.#db
      .execute(`SELECT * FROM chat_list ORDER BY lastChatTime DESC`)
      .then((result) => result[0]);
  };
};
