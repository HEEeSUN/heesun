export default class UserRepository {
  #db;
  
  constructor(db) {
    this.#db = db;
  }

  findByUsername = async (username) => {
    return this.#db
      .execute(`SELECT * FROM users WHERE username=?`, [username])
      .then((result) => result[0][0]);
  };

  createUser = async (
    username,
    password,
    name,
    email,
    phone,
    address,
    extraAddress
  ) => {
    return this.#db
      .execute(
        `INSERT INTO users (username, password, name, email, class, phone, address, extra_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
          username,
          password,
          name,
          email,
          "silver",
          phone,
          address,
          extraAddress || '',
        ])
      .then((result) => result[0].insertId);
  };

  createUserKakao = async (kakao_account) => {
    return this.#db
      .execute(`INSERT INTO users (username, oauth) VALUES (?, ?)`, [
        kakao_account,
        "kakao",
      ])
      .then((result) => result[0].insertId);
  };

  findById = async (id) => {
    return this.#db
      .execute("SELECT * FROM users WHERE id=?", [id])
      .then((result) => result[0][0]);
  };

  findByUsernameAndEmail = async (username, email) => {
    return this.#db
      .execute(`SELECT * FROM users WHERE username=? AND email=?`, [
        username,
        email,
      ])
      .then((result) => result[0][0]);
  };

  findByNameAndEmail = async (name, email) => {
    return this.#db
      .execute(`SELECT * FROM users WHERE email=? AND name=?`, [email, name])
      .then((result) => result[0][0]);
  };

  updatePassword = async (username, password) => {
    return this.#db
      .execute(`UPDATE users SET password=? WHERE username=?`, [
        password,
        username,
      ]);
  };

  addInCart = async (product_code, option_number, quantity, userId) => {
    return this.#db
      .execute(`INSERT INTO cart (product_code, option_number, quantity, userId) VALUES (?, ?, ?, ?)`, [
        product_code, option_number, quantity, userId
      ])
      .then((result) => result[0].insertId);
  };

  getInCart = async (userId, today) => {
    return this.#db
      .execute(`SELECT cart_id, stock, main_img_src, product_code, option_number, name, option1, option2, price, quantity, sale_price
                FROM (product NATURAL JOIN (SELECT * FROM product_option WHERE disabled is not true)A
                LEFT JOIN (
                  (SELECT * 
                  FROM sale_product NATURAL JOIN time_sale_table
                  WHERE start < '${today}' and end > '${today}')
                  UNION
                  (SELECT * 
                  FROM sale_product LEFT JOIN time_sale_table 
                  USING(time_id)
                  WHERE time_id is null)
                )B
                USING(product_code, option_number)
                NATURAL JOIN (SELECT * FROM cart WHERE userId=?)C)`, [userId])
      .then((result) => result[0]);
  };

  getQuantityInCart = async (userId) => {
    return this.#db
      .execute(`SELECT count(cart_id) as quantity FROM cart WHERE userId=?`, [
        userId,
      ])
      .then((result) => result[0][0]);
  };

  getUserInfo = async (username) => {
    return this.#db
      .execute(
        `SELECT name, phone, email, address, extra_address FROM users WHERE username=?`,
        [username]
      )
      .then((result) => result[0][0]);
  };

  modifyUserInfo = async (userInfo, userId) => {
    return this.#db
      .execute(`UPDATE users SET name=?, phone=?, email=?, address=?, extra_address=? WHERE id=?`, [
        userInfo.name,
        userInfo.phone,
        userInfo.email,
        userInfo.address,
        userInfo.extra_address,
        userId,
      ]);
  };

  modifyUserInfoAndPw = async (userInfo, userId, hashed) => {
    return this.#db
      .execute(`UPDATE users SET name=?, password=?, phone=?, email=?, address=?, extra_address=? WHERE id=?`, [
        userInfo.name,
        hashed,
        userInfo.phone,
        userInfo.email,
        userInfo.address,
        userInfo.extra_address,
        userId,
      ]);
  };

  deleteProduct = async (userId, cart_id) => {
    return this.#db
      .execute(`DELETE FROM cart WHERE userId=? AND cart_id IN (${cart_id})`, [userId])
      .then((result) => result[0].affectedRows);
  };

  adjustmentQuantityInCart = async (quantity, id) => {
    return this.#db
      .execute(`UPDATE cart SET quantity=? WHERE cart_id=?`, [quantity, id])
      .then((result) => result[0]);
  };

  getDeliveryStatus = async (detail_id) => {
    return this.#db
      .execute(
        `SELECT status, DATE_FORMAT(date, "%Y-%m-%d")AS "date" FROM deliverystatus WHERE detail_id=?`, [
          detail_id
        ])
      .then((result) => result[0]);
  };

  getOrder = async (username, date1, date2, amountOfSendData, prevPage) => {
    return this.#db
      .execute(`SELECT order_id, count(*) OVER() AS full_count, DATE_FORMAT(createdAt, "%Y-%m-%d")AS "created" 
                FROM orders 
                WHERE username=? AND createdAt BETWEEN '${date1}' AND '${date2}' 
                ORDER BY createdAt DESC
                LIMIT ${amountOfSendData} OFFSET ${prevPage}`, [
                  username
                ])
      .then((result) => result[0]);
  };

  getOrderDetail = async (id) => {
    return this.#db
      .execute("SELECT * FROM order_detail WHERE order_id=?", [id])
      .then((result) => result[0]);
  };

  getMyReview = async (username, amountOfSendData, prevPage) => {
    return this.#db
      .execute(`SELECT review_id, main_img_src, product_name, product_code, detail_id, content, count(*) OVER() AS full_count, DATE_FORMAT(createdAt, "%Y-%m-%d")AS "created" 
                FROM reviews NATURAL JOIN order_detail
                WHERE username=? 
                ORDER BY createdAt DESC
                LIMIT ${amountOfSendData} OFFSET ${prevPage}`, [username])
      .then((result) => result[0]);
  };

  getMyPost = async (username, amountOfSendData, prevPage) => {
    return this.#db
      .execute(`SELECT title, username, post_id, DATE_FORMAT(createdAt, "%Y-%m-%d")AS "createdAt", count(*) OVER() AS full_count 
                FROM posts 
                WHERE username=?
                ORDER BY posts.createdAt DESC
                LIMIT ${amountOfSendData} OFFSET ${prevPage}`, [username])
      .then((result) => result[0]);
  };

  getMyComment = async (username, amountOfSendData, prevPage) => {
    return this.#db
      .execute(`SELECT DISTINCT title, RPAD(LEFT(posts.username, 3), 6, '*')AS username, posts.post_id, DATE_FORMAT(posts.createdAt, "%Y-%m-%d")AS "createdAt", count(*) OVER() AS full_count   
                FROM posts JOIN comments USING(post_id) 
                WHERE comments.username=?
                group by posts.post_id 
                ORDER BY posts.createdAt DESC
                LIMIT ${amountOfSendData} OFFSET ${prevPage}`, [username])
      .then((result) => result[0]);
  };

  getWritableReview = async (username, amountOfSendData, prevPage) => {
    return this.#db
      .execute(`SELECT main_img_src, product_name, product_code, detail_id, count(*) OVER() AS full_count 
                FROM orders NATURAL JOIN order_detail 
                WHERE username=? AND status="배송완료"
                LIMIT ${amountOfSendData} OFFSET ${prevPage}`, [username])
      .then((result) => result[0]);
  };

  writeReview = async (detail_id, username, product_code, text) => {
    let conn;

    try {
      conn = await this.#db.getConnection();
      await conn.beginTransaction();

      const query1 = conn.execute(
        `INSERT INTO reviews (username, product_code, detail_id, content, createdAt) VALUES (?, ?, ?, ?, ?)`, [
          username, 
          product_code, 
          detail_id, 
          text, 
          new Date()
        ]);

      const query2 = conn.execute(
        `UPDATE order_detail SET status=? WHERE detail_id=?`, [
          "리뷰작성완료", 
          detail_id
        ]);

      const query3 = conn.execute(
        `INSERT INTO deliverystatus (status, date, detail_id) VALUES (?, ?, ?)`, [
          "리뷰작성완료", 
          new Date(), 
          detail_id
        ]);

      const results = await Promise.all([query1, query2, query3]);

      await conn.commit();
      return results[0][0].insertId;
    } catch (error) {
      console.log(error);
      await conn.rollback();
      throw new Error(error);
    } finally {
      conn.release();
    }
  };

  checkInCart = async (userId, product_code, option_number) => {
    return this.#db
      .execute(`SELECT * 
                FROM cart WHERE 
                userId=? AND product_code=? AND option_number=?`, [
                  userId, 
                  product_code, 
                  option_number
                ])
      .then((result) => result[0][0]);
  };

  increaseQuantity = async (product_code, option_number, quantity, userId) => {
    return this.#db
      .execute(`UPDATE cart SET quantity = quantity+${quantity} WHERE userId=? AND product_code=? AND option_number=?`, [
        userId, 
        product_code, 
        option_number
      ])
      .then((result) => result[0]);
  };

  getByProduct_code = async (product_code) => {
    return this.#db
      .execute(`SELECT product_code, option_number, name, price, main_img_src, description, option1, option2, stock, sale_price, start, end
                FROM (product NATURAL JOIN product_option) 
                LEFT JOIN (SELECT * 
                          FROM sale_product LEFT JOIN time_sale_table
                          USING(time_id))A
                USING(product_code, option_number)
                WHERE disabled IS NOT true and product_code=?`, [product_code])
      .then((result) => result[0]);
  };

  getOrderDetailByUsername = async (id, username) => {
    return this.#db
      .execute(`
        SELECT product_code 
        FROM orders NATURAL JOIN order_detail 
        WHERE detail_id=? AND username=?`, [
          id, 
          username
        ])
      .then((result) => result[0][0]);
  };
}
