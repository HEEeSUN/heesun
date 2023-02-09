export default class CommunityRepository {
  #db;

  constructor(db) {
    this.#db = db;
  }

  checkExistPost = async (postId) => {
    return this.#db
      .execute(`
        SELECT EXISTS (
          SELECT * 
          FROM posts 
          WHERE post_id=?
        ) as existence`, [postId])
      .then((result) => result[0][0].existence)
  }

  writePost = async (title, content, username) => {
    return this.#db
      .execute(`INSERT INTO posts (title, username, content, createdAt) VALUES (?, ?, ?, ?)`, [
          title, 
          username, 
          content, 
          new Date()
        ])
      .then((result) => result[0].insertId);
  };

  modifyPost = async (postId, username, title, content) => {
    return this.#db
      .execute(`UPDATE posts SET title=? , content=?  WHERE post_id=? AND username=?`, [
        title,
        content,
        postId,
        username
      ])
      .then((result) => result[0].affectedRows);
  };

  getAmountOfPosts = async () => {
    return this.#db
      .execute(`SELECT count(*) AS amount
                FROM posts`)
      .then((result) => result[0][0].amount);
  };

  getAmountOfPostsByWordAndCategory = async (cat, search) => {
    return this.#db
      .execute(`SELECT count(*) AS amount
                FROM posts
                WHERE ${this.#db.escapeId(cat)} LIKE '%${search}%'`)
      .then((result) => result[0][0].amount);
  };

  getAmountOfPostsByWord = async (search) => {
    return this.#db
      .execute(`SELECT count(*) AS amount
                FROM posts
                WHERE username LIKE '%${search}%' OR title LIKE '%${search}%'`)
      .then((result) => result[0][0].amount);
  };

  getAllPosts = async (amountOfSendData, prevPage) => {
    return this.#db
      .execute(`SELECT post_id, title, RPAD(LEFT(username, 3), 6, '*')AS username, createdAt 
                FROM posts 
                ORDER BY createdAt DESC
                LIMIT ${amountOfSendData} OFFSET ${prevPage}`)
      .then((result) => result[0]);
  };

  getAllPostsByWordAndCategory = async (
    cat,
    search,
    amountOfSendData,
    prevPage
  ) => {
    return this.#db
      .execute(`SELECT post_id, title, RPAD(LEFT(username, 3), 6, '*')AS username, createdAt 
                FROM posts 
                WHERE ${this.#db.escapeId(cat)} LIKE '%${search}%' 
                ORDER BY createdAt DESC
                LIMIT ${amountOfSendData} OFFSET ${prevPage}`)
      .then((result) => result[0]);
  };

  getAllPostsByWord = async (search, amountOfSendData, prevPage) => {
    return this.#db
      .execute(`SELECT post_id, title, RPAD(LEFT(username, 3), 6, '*')AS username, createdAt
                FROM posts 
                WHERE username LIKE '%${search}%' OR title LIKE '%${search}%' 
                ORDER BY createdAt DESC
                LIMIT ${amountOfSendData} OFFSET ${prevPage}`)
      .then((result) => result[0]);
  };

  getPostById = async (postId) => {
    return this.#db
      .execute(`SELECT post_id, title, RPAD(LEFT(username, 3), 6, '*')AS username, username AS originUsername, content, DATE_FORMAT(createdAt, "%Y-%m-%d")AS "createdAt" 
                FROM posts 
                WHERE post_id=?`, [postId])
      .then((result) => result[0][0]);
  };

  getAmountOfComments = async (postId) => {
    return this.#db
      .execute(`SELECT count(*) AS amount
                FROM comments 
                WHERE post_id=?`, [postId])
      .then((result) => result[0][0].amount);
  };

  getComments = async (postId, amountOfSendData, prevPage) => {
    return this.#db
      .execute(`SELECT comment_id, content, RPAD(LEFT(username, 3), 6, '*')AS username, username AS originUsername, createdAt 
                FROM comments 
                WHERE post_id=?
                LIMIT ${amountOfSendData} OFFSET ${prevPage}`, [postId])
      .then((result) => result[0]);
  };

  writeComment = async (postId, comment, username) => {
    return this.#db
      .execute(`INSERT INTO comments (post_id, content, username, createdAt) VALUES (?, ?, ?, ?)`, [
          postId, 
          comment, 
          username, 
          new Date()
        ])
      .then((result) => result[0].insertId);
  };

  deletePost = async (postId, username) => {
    return this.#db
      .execute(`DELETE FROM posts WHERE post_id=? AND username=?`, [
        postId,
        username,
      ])
      .then((result) => result[0].affectedRows);
  };

  deleteComment = async (comment_id, username) => {
    return this.#db
      .execute(`DELETE FROM comments WHERE comment_id=? AND username=?`, [
        comment_id,
        username,
      ])
      .then((result) => result[0].affectedRows);
  };
}
