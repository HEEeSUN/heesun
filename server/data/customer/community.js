import db from "../../db/database.js";

export async function writePost(title, content, username) {
  return db
    .execute(
      `INSERT INTO posts (title, username, content, createdAt) VALUES (?, ?, ?, ?)`,
      [title, username, content, new Date()]
    )
    .then((result) => result[0].insertId);
}

export async function modifyPost(postId, title, content) {
  return db
    .execute(`UPDATE posts SET title=? , content=?  WHERE post_id=?`, [
      title,
      content,
      postId,
    ])
    .then((result) => result[0].affectedRows);
}

export async function getAmountOfPosts() {
  return db
    .execute(
      `SELECT count(*) as amount
              FROM posts`
    )
    .then((result) => result[0][0].amount);
}

export async function getAmountOfPostsByWordAndCategory(cat, search) {
  return db
    .execute(
      `SELECT count(*) as amount
              FROM posts
              WHERE ${db.escapeId(cat)} LIKE '%${search}%'`
    )
    .then((result) => result[0][0].amount);
}

export async function getAmountOfPostsByWord(search) {
  return db
    .execute(
      `SELECT count(*) as amount
              FROM posts
              WHERE username LIKE '%${search}%' OR title LIKE '%${search}%' `
    )
    .then((result) => result[0][0].amount);
}

export async function getAllPosts(amountOfSendData, prevPage) {
  return db
    .execute(
      `SELECT post_id, title, RPAD(LEFT(username, 3), 6, '*')AS username, createdAt 
              FROM posts 
              ORDER BY createdAt DESC
              LIMIT ${amountOfSendData} OFFSET ${prevPage}`
    )
    .then((result) => result[0]);
}

export async function getAllPostsByWordAndCategory(
  cat,
  search,
  amountOfSendData,
  prevPage
) {
  return db
    .execute(
      `SELECT post_id, title, RPAD(LEFT(username, 3), 6, '*')AS username, createdAt 
              FROM posts 
              WHERE ${db.escapeId(cat)} LIKE '%${search}%' 
              ORDER BY createdAt DESC
              LIMIT ${amountOfSendData} OFFSET ${prevPage}`
    )
    .then((result) => result[0]);
}

export async function getAllPostsByWord(search, amountOfSendData, prevPage) {
  return db
    .execute(
      `SELECT post_id, title, RPAD(LEFT(username, 3), 6, '*')AS username, createdAt
              FROM posts 
              WHERE username LIKE '%${search}%' OR title LIKE '%${search}%' 
              ORDER BY createdAt DESC
              LIMIT ${amountOfSendData} OFFSET ${prevPage}`
    )
    .then((result) => result[0]);
}

export async function getPostById(postId) {
  return db
    .execute(
      `SELECT post_id, title, RPAD(LEFT(username, 3), 6, '*')AS username, username AS originUsername, content, DATE_FORMAT(createdAt, "%Y-%m-%d")AS "createdAt" 
              FROM posts 
              WHERE post_id=?`,
      [postId]
    )
    .then((result) => result[0][0]);
}

export async function getAmountOfComments(postId) {
  return db
    .execute(
      `SELECT count(*) as amount
              FROM comments 
              WHERE post_id=?`,
      [postId]
    )
    .then((result) => result[0][0].amount);
}

export async function getComments(postId, amountOfSendData, prevPage) {
  return db
    .execute(
      `SELECT comment_id, content, RPAD(LEFT(username, 3), 6, '*')AS username, username AS originUsername, createdAt 
              FROM comments 
              WHERE post_id=?
              LIMIT ${amountOfSendData} OFFSET ${prevPage}`,
      [postId]
    )
    .then((result) => result[0]);
}

export async function writeComment(postId, comment, username) {
  return db
    .execute(
      `INSERT INTO comments (post_id, content, username, createdAt) VALUES (?, ?, ?, ?)`,
      [postId, comment, username, new Date()]
    )
    .then((result) => result[0].insertId);
}

export async function deletePost(postId, username) {
  return db
    .execute("DELETE FROM posts WHERE post_id=? AND username=?", [
      postId,
      username,
    ])
    .then((result) => result[0].affectedRows);
}

export async function deleteComment(comment_id, username) {
  return db
    .execute("DELETE FROM comments WHERE comment_id=? AND username=?", [
      comment_id,
      username,
    ])
    .then((result) => result[0].affectedRows);
}
