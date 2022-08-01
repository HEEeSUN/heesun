import db from "../../db/database.js";

export async function findByUsername(username) {
  return db
    .execute(`SELECT * FROM users WHERE username=?`, [username])
    .then((result) => result[0][0]);
}

export async function createUser(
  username,
  password,
  name,
  email,
  phone,
  address,
  extraAddress
) {
  return db
    .execute(
      `INSERT INTO users (username, password, name, email, class, phone, address, extra_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [username, password, name, email, "silver", phone, address, extraAddress]
    )
    .then((result) => result[0].insertId);
}

export async function createUserKakao(kakao_account) {
  return db
    .execute(`INSERT INTO users (username, oauth) VALUES (?, ?)`, [
      kakao_account,
      "kakao",
    ])
    .then((result) => result[0].insertId);
}

export async function findByUserId(id) {
  return db
    .execute("SELECT * FROM users WHERE id=?", [id])
    .then((result) => result[0][0]);
}

export async function findByUsernameAndEmail(username, email) {
  return db
    .execute(`SELECT * FROM users WHERE username=? AND email=?`, [
      username,
      email,
    ])
    .then((result) => result[0][0]);
}

export async function findByNameAndEmail(name, email) {
  return db
    .execute(`SELECT * FROM users WHERE email=? AND name=?`, [email, name])
    .then((result) => result[0][0]);
}

export async function updatePassword(username, password) {
  return db.execute(`UPDATE users SET password=? WHERE username=?`, [
    password,
    username,
  ]);
}

export async function upgradeClass(username, className) {
  return db.execute(`UPDATE users SET class=? WHERE username=?`, [
    className,
    username,
  ]);
}

export async function addInCart(product_code, option_number, quantity, userId) {
  return db
    .execute(
      `INSERT INTO cart (product_code, option_number, quantity, userId) VALUES (?, ?, ?, ?)`,
      [product_code, option_number, quantity, userId]
    )
    .then((result) => result[0].insertId);
}

export async function getInCart(userId, today) {
  return db
    .execute(
      `SELECT cart_id, stock, main_img_src, product_code, option_number, name, option1, option2, price, quantity, sale_price
       FROM (product NATURAL JOIN (SELECT * FROM product_option WHERE disabled is not true)A
       LEFT JOIN (
              (SELECT * 
              FROM sale_product NATURAL JOIN time_sale_table
              WHERE start < '${today}' and end > '${today}')
              UNION
              (SELECT * 
              FROM sale_product LEFT JOIN time_sale_table 
              USING(time_id)
              WHERE time_id is null
              )
        )B
        USING(product_code, option_number)
        NATURAL JOIN (SELECT * FROM cart WHERE userId=?)C)`,
      [userId]
    )
    .then((result) => result[0]);
}

export async function getQuantityInCart(userId) {
  return db
    .execute(`SELECT count(cart_id) as quantity FROM cart WHERE userId=?`, [
      userId,
    ])
    .then((result) => result[0][0]);
}

export async function getUserInfo(username) {
  return db
    .execute(
      `SELECT name, phone, email, address, extra_address FROM users WHERE username=?`,
      [username]
    )
    .then((result) => result[0][0]);
}

export async function modifyUserInfo(userInfo) {
  return db.execute(
    `UPDATE users SET name=?, phone=?, email=?, address=?, extra_address=? WHERE username=?`,
    [
      userInfo.name,
      userInfo.phone,
      userInfo.email,
      userInfo.address,
      userInfo.extra_address,
      userInfo.username,
    ]
  );
}

export async function modifyUserInfoAndPw(userInfo, hashed) {
  return db.execute(
    `UPDATE users SET name=?, password=?, phone=?, email=?, address=?, extra_address=? WHERE username=?`,
    [
      userInfo.name,
      hashed,
      userInfo.phone,
      userInfo.email,
      userInfo.address,
      userInfo.extra_address,
      userInfo.username,
    ]
  );
}

export async function findPaymentId(id) {
  // 환불 관련 추가 결제시.... > 나중에 별도의 payment table 생성 예정
  return db
    .execute(`SELECT payment_id FROM orders WHERE order_id=?`, [id])
    .then((result) => result[0][0].payment_id);
}

export async function cancelOrder(paymentId, orderId) {
  let conn;

  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    const query1 = conn.execute(
      `UPDATE order_detail SET status='주문취소' WHERE order_id=?`,
      [orderId]
    );
    const query2 = conn.execute(
      "UPDATE payment SET amount=0, shippingfee=0, products_price=0, rest_refund_amount=0 WHERE payment_id=?",
      [paymentId]
    );

    await Promise.all([query1, query2]);

    await conn.commit();
    return;
  } catch (error) {
    console.log(error);
    await conn.rollback();
    throw new Error(error);
  } finally {
    conn.release();
  }
}

export async function cancelPayment(id) {
  // 환불 관련 추가 결제시.... > 나중에 별도의 payment table 생성 예정
  return db
    .execute(`DELETE FROM payment WHERE payment_id=?`, [id])
    .then((result) => result[0]);
}

export async function deletePaymentByPaymentId(paymentId) {
  return db.execute("DELETE FROM payment WHERE payment_id=?", [paymentId]);
}

export async function deletePayment(merchantUID) {
  return db.execute("DELETE FROM payment WHERE merchantUID=?", [merchantUID]);
}

export async function updatePayment(imp_uid, merchant_uid) {
  return db.execute("UPDATE payment SET imp_uid=? WHERE merchantUID=?", [
    imp_uid,
    merchant_uid,
  ]);
}

export async function order(
  username,
  paymentId,
  orderer,
  phone,
  address,
  extra_address
) {
  return db
    .execute(
      `INSERT INTO orders (username, createdAt, payment_id, orderer, phone, address, extra_address) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [username, new Date(), paymentId, orderer, phone, address, extra_address]
    )
    .then((result) => result[0].insertId);
}

export async function increaseStock(newArray) {
  let conn;

  try {
    conn = await db.getConnection();
    await conn.beginTransaction();
    for (let i = 0; i < newArray.length; i++) {
      await conn.execute(
        `UPDATE product_option SET stock = stock+${newArray[i].quantity} WHERE product_code=? AND option_number=?`,
        [newArray[i].product_code, newArray[i].option_number]
      );
    }

    await conn.commit();
    return true;
  } catch (error) {
    console.log(error);
    await conn.rollback();
    return false;
  } finally {
    conn.release();
  }
}

export async function orderDetail(status, orderId, orderArray) {
  let conn;

  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    for (let i = 0; i < orderArray.length; i++) {
      const {
        product_code,
        option_number,
        name,
        option1,
        option2,
        quantity,
        price,
        sale_price,
        main_img_src,
        cart_id,
      } = orderArray[i];

      const query1 = conn.execute(
        `INSERT INTO order_detail (order_id, product_code, product_name, option1, option2, quantity, price, main_img_src, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          product_code,
          name,
          option1,
          option2,
          quantity,
          sale_price || price,
          main_img_src,
          status,
        ]
      );

      const query2 = conn.execute(
        `UPDATE product_option SET stock = stock-${quantity} WHERE product_code=? AND option_number=?`,
        [product_code, option_number]
      );

      const query3 = conn.execute("DELETE FROM cart WHERE cart_id=?", [
        cart_id,
      ]);

      const results = await Promise.all([query1, query2, query3]);

      await conn.execute(
        `INSERT INTO deliverystatus (status, date, detail_id) VALUES (?, ?, ?)`,
        [status, new Date(), results[0][0].insertId]
      );
    }

    await conn.commit();
    return true;
  } catch (error) {
    console.log(error);
    await conn.rollback();
    return false;
  } finally {
    conn.release();
  }
}

export async function deleteProduct(cart_id) {
  return db
    .execute(`DELETE FROM cart WHERE cart_id IN (${cart_id})`)
    .then((result) => result[0].affectedRows);
}

export async function adjustmentQuantityInCart(quantity, id) {
  return db
    .execute(`UPDATE cart SET quantity=? WHERE cart_id=?`, [quantity, id])
    .then((result) => result[0]);
}

export async function getDeliveryStatus(detail_id) {
  return db
    .execute(
      `SELECT status, DATE_FORMAT(date, "%Y-%m-%d")AS "date" FROM deliverystatus WHERE detail_id=?`,
      [detail_id]
    )
    .then((result) => result[0]);
}

export async function getOrder(
  username,
  date1,
  date2,
  amountOfSendData,
  prevPage
) {
  return db
    .execute(
      `SELECT order_id, count(*) OVER() AS full_count, DATE_FORMAT(createdAt, "%Y-%m-%d")AS "created" 
    FROM orders 
    WHERE username=? AND createdAt BETWEEN '${date1}' AND '${date2}' 
    ORDER BY createdAt DESC
    LIMIT ${amountOfSendData} OFFSET ${prevPage}`,
      [username]
    )
    .then((result) => result[0]);
}

export async function getAmount(merchantUID) {
  return db
    .execute(`SELECT * FROM payment WHERE merchantUID=?`, [merchantUID])
    .then((result) => result[0][0]);
}

export async function getOrderDetail(id) {
  return db
    .execute("SELECT * FROM order_detail WHERE order_id=?", [id])
    .then((result) => result[0]);
}

export async function getRefundOrder(id) {
  return db
    .execute(
      `SELECT * FROM payment JOIN orders USING(payment_id) WHERE order_id=?`,
      [id]
    )
    .then((result) => result[0][0]);
}

export async function requestRefund(
  merchantUID,
  impUID,
  refundProduct,
  pendingRefundAmountForProduct,
  returnShippingFee,
  pendingRefundAmountForShipping
) {
  let conn;

  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    const query1 = conn.execute(
      `insert into refund (merchantUID, impUID, refundShippingFee, refundProductPrice, returnShippingFee) values(?,?,?,?,?)`,
      [
        merchantUID,
        impUID,
        pendingRefundAmountForShipping,
        pendingRefundAmountForProduct,
        returnShippingFee,
      ]
    );

    const query2 = conn.execute(
      `UPDATE payment SET pending_refund=pending_refund+${pendingRefundAmountForProduct} WHERE merchantUID=?`,
      [merchantUID]
    );

    const results = await Promise.all([query1, query2]);

    for (let i = 0; i < refundProduct.length; i++) {
      conn.execute(
        `UPDATE order_detail SET status=?, refundStatus=?, refundId=? WHERE detail_id=?`,
        [
          "반품및취소요청",
          "waiting",
          results[0][0].insertId,
          refundProduct[i].detail_id,
        ]
      );
    }

    await conn.commit();
    return results[0][0].insertId;
  } catch (error) {
    console.log(error);
    await conn.rollback();
  } finally {
    conn.release();
  }
}

export async function cancelRefund(
  newMerchantUID,
  refundId,
  refundProduct,
  pendingRefundAmountForProduct,
  restOfProductPrice,
  restOfShippingFee,
  restOfRefundAmount,
  returnShippingFee,
  refundAmount,
  merchantUID
) {
  let conn;

  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    let query;

    if (newMerchantUID) {
      query = conn.execute(`DELETE FROM payment WHERE merchantUID=?`, [
        newMerchantUID,
      ]);
    }

    const query1 = conn.execute(
      `UPDATE payment SET products_price=?, shippingfee=?, rest_refund_amount=?, return_shippingfee=?, refund_amount=?, pending_refund=? WHERE merchantUID=?`,
      [
        restOfProductPrice,
        restOfShippingFee,
        restOfRefundAmount,
        returnShippingFee,
        refundAmount,
        pendingRefundAmountForProduct,
        merchantUID,
      ]
    );

    const query2 = async () => {
      for (let i = 0; i < refundProduct.length; i++) {
        conn.execute(
          `UPDATE order_detail SET status=?, refundStatus=? WHERE detail_id=?`,
          [refundProduct[i].status, "", refundProduct[i].detail_id]
        );
      }
    };

    const query3 = conn.execute(`DELETE FROM refund WHERE refundId=?`, [
      refundId,
    ]);

    if (query) {
      await Promise.all([query, query1, query2(), query3]);
    }

    await Promise.all([query1, query2(), query3]);

    await conn.commit();
  } catch (error) {
    console.log(error);
    await conn.rollback();
  } finally {
    conn.release();
  }
}

export async function refund(
  restOfProductPrice,
  restOfShippingFee,
  restOfRefundAmount,
  returnShippingFee,
  refundAmount,
  merchantUID,
  refundProduct
) {
  let conn;

  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    const query1 = conn.execute(
      `UPDATE payment SET products_price=?, shippingfee=?, rest_refund_amount=?, return_shippingfee=?, refund_amount=refund_amount+${refundAmount} WHERE merchantUID=?`,
      [
        restOfProductPrice,
        restOfShippingFee,
        restOfRefundAmount,
        returnShippingFee,
        merchantUID,
      ]
    );

    const query2 = async () => {
      for (let i = 0; i < refundProduct.length; i++) {
        conn.execute(
          `UPDATE order_detail SET status=?, refundStatus=? WHERE detail_id=?`,
          ["반품및취소완료", "complete", refundProduct[i].detail_id]
        );
      }
    };

    await Promise.all([query1, query2()]);

    await conn.commit();
  } catch (error) {
    console.log(error);
    await conn.rollback();
  } finally {
    conn.release();
  }
}

export async function getMyReview(username, amountOfSendData, prevPage) {
  return db
    .execute(
      `SELECT review_id, main_img_src, product_name, product_code, detail_id, content, count(*) OVER() AS full_count, DATE_FORMAT(createdAt, "%Y-%m-%d")AS "created" 
            FROM reviews NATURAL JOIN order_detail
            WHERE username=? 
            ORDER BY createdAt DESC
            LIMIT ${amountOfSendData} OFFSET ${prevPage}`,
      [username]
    )
    .then((result) => result[0]);
}

export async function getMyPost(username, amountOfSendData, prevPage) {
  return db
    .execute(
      `SELECT title, username, post_id, DATE_FORMAT(createdAt, "%Y-%m-%d")AS "createdAt", count(*) OVER() AS full_count 
            FROM posts 
            WHERE username=?
            ORDER BY posts.createdAt DESC
            LIMIT ${amountOfSendData} OFFSET ${prevPage}`,
      [username]
    )
    .then((result) => result[0]);
}

export async function getMyComment(username, amountOfSendData, prevPage) {
  return db
    .execute(
      `SELECT DISTINCT title, RPAD(LEFT(posts.username, 3), 6, '*')AS username, posts.post_id, DATE_FORMAT(posts.createdAt, "%Y-%m-%d")AS "createdAt", count(*) OVER() AS full_count   
            FROM posts JOIN comments USING(post_id) 
            WHERE comments.username=?
            group by posts.post_id 
            ORDER BY posts.createdAt DESC
            LIMIT ${amountOfSendData} OFFSET ${prevPage}`,
      [username]
    )
    .then((result) => result[0]);
}

export async function getWritableReview(username, amountOfSendData, prevPage) {
  return db
    .execute(
      `SELECT main_img_src, product_name, product_code, detail_id, count(*) OVER() AS full_count 
            FROM orders NATURAL JOIN order_detail 
            WHERE username=? AND status="배송완료"
            LIMIT ${amountOfSendData} OFFSET ${prevPage}`,
      [username]
    )
    .then((result) => result[0]);
}

export async function writeReview(detail_id, username, product_code, text) {
  let conn;

  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    const query1 = conn.execute(
      `INSERT INTO reviews (username, product_code, detail_id, content, createdAt) VALUES (?, ?, ?, ?, ?)`,
      [username, product_code, detail_id, text, new Date()]
    );

    const query2 = conn.execute(
      `UPDATE order_detail SET status=? WHERE detail_id=?`,
      ["리뷰작성완료", detail_id]
    );

    const query3 = conn.execute(
      `INSERT INTO deliverystatus (status, date, detail_id) VALUES (?, ?, ?)`,
      ["리뷰작성완료", new Date(), detail_id]
    );

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
}

export async function checkInCart(userId, product_code, option_number) {
  return db
    .execute(
      "SELECT * FROM cart WHERE userId=? AND product_code=? AND option_number=?",
      [userId, product_code, option_number]
    )
    .then((result) => result[0][0]);
}

export async function increaseQuantity(
  product_code,
  option_number,
  quantity,
  userId
) {
  return db
    .execute(
      `UPDATE cart SET quantity = quantity+${quantity} WHERE userId=? AND product_code=? AND option_number=?`,
      [userId, product_code, option_number]
    )
    .then((result) => result[0]);
}

export async function checkStock(product_code, option_number) {
  return db
    .execute(
      `SELECT stock FROM product A JOIN product_option B ON A.product_code = B.product_code WHERE A.product_code=? AND option_number=?`,
      [product_code, option_number]
    )
    .then((result) => result[0][0]);
}

export async function insertInfoForExtra(username, extraCharge) {
  return db
    .execute(`INSERT INTO payment (username, amount) VALUES (?, ?)`, [
      username,
      extraCharge,
    ])
    .then((result) => result[0].insertId);
}

export async function insertInfoForPayment(
  username,
  amount,
  shippingFee,
  productPrice
) {
  return db
    .execute(
      `INSERT INTO payment (username, amount, shippingfee, products_price, rest_refund_amount) VALUES (?, ?, ?, ?, ?)`,
      [username, amount, shippingFee, productPrice, amount]
    )
    .then((result) => result[0].insertId);
}

export async function updateMarchantUID(id, merchantUID) {
  return db
    .execute(
      `UPDATE payment SET merchantUID = '${merchantUID}' WHERE payment_id=?`,
      [id]
    )
    .then((result) => result[0]);
}

export async function getByProduct_code(product_code) {
  return db
    .execute(
      `SELECT product_code, option_number, name, price, main_img_src, description, option1, option2, stock, sale_price, start, end
              FROM (product NATURAL JOIN product_option) 
              LEFT JOIN (SELECT * 
                        FROM sale_product LEFT JOIN time_sale_table
                        USING(time_id))A
              USING(product_code, option_number)
              WHERE disabled IS NOT true and product_code=?`,
      [product_code]
    )
    .then((result) => result[0]);
}
