export default class AdminOrderRepository {
  #db

  constructor(db) {
    this.#db = db;
  }

  getOrderAll = async (date1, date2, amountOfSendData, prevPage) => {
    return this.#db
      .execute(`SELECT createdAt, product_code, product_name, merchantUID, quantity, payment.username, status, detail_id, refundStatus, phone, address, extra_address, count(*) OVER() AS full_count, DATE_FORMAT(createdAt, "%Y-%m-%d") AS "created", orderer as name
                FROM (orders NATURAL JOIN order_detail) LEFT JOIN payment USING (payment_id)
                WHERE createdAt BETWEEN '${date1}' AND '${date2}'
                ORDER BY createdAt DESC
                LIMIT ${amountOfSendData} OFFSET ${prevPage}`)
      .then((result) => result[0]);
  };

  getOrderBySearchWord = async (
    date1,
    date2,
    searchWord,
    amountOfSendData,
    prevPage
  ) => {
    return this.#db
      .execute(`SELECT createdAt, product_code, product_name, merchantUID, quantity, payment.username, status, detail_id, refundStatus, phone, address, extra_address, count(*) OVER() AS full_count, DATE_FORMAT(createdAt, "%Y-%m-%d") AS "created", orderer as name
                FROM (orders NATURAL JOIN order_detail) LEFT JOIN payment USING (payment_id)
                WHERE (createdAt BETWEEN '${date1}' AND '${date2}') AND (product_code LIKE '%${searchWord}%' OR product_name LIKE '%${searchWord}%'
                  OR payment.username LIKE '%${searchWord}%' OR orderer LIKE '%${searchWord}%' OR merchantUID LIKE '%${searchWord}%')
                ORDER BY createdAt DESC
                LIMIT ${amountOfSendData} OFFSET ${prevPage}`)
      .then((result) => result[0]);
  };

  getOrderByStatus = async (
    date1,
    date2,
    status,
    searchWord,
    amountOfSendData,
    prevPage
  ) => {
    return this.#db
      .execute(`SELECT createdAt, product_code, product_name, merchantUID, quantity, payment.username, status, detail_id, refundStatus, phone, address, extra_address, count(*) OVER() AS full_count, DATE_FORMAT(createdAt, "%Y-%m-%d") AS "created", orderer as name
                FROM (orders NATURAL JOIN order_detail) LEFT JOIN payment USING (payment_id)
                WHERE (createdAt BETWEEN '${date1}' AND '${date2}') AND (status='${status}') AND (product_code LIKE '%${searchWord}%' OR product_name LIKE '%${searchWord}%'
                  OR payment.username LIKE '%${searchWord}%' OR orderer LIKE '%${searchWord}%')
                ORDER BY createdAt DESC
                LIMIT ${amountOfSendData} OFFSET ${prevPage}`)
      .then((result) => result[0]);
  };

  getOrderByWordAndCategory = async (
    date1,
    date2,
    category,
    searchWord,
    amountOfSendData,
    prevPage
  ) => {
    if (category === "username") {
      category = "payment.username";
    }
    return this.#db
      .execute(`SELECT createdAt, product_code, product_name, merchantUID, quantity, payment.username, status, detail_id, refundStatus, phone, address, extra_address, count(*) OVER() AS full_count, DATE_FORMAT(createdAt, "%Y-%m-%d") AS "created", orderer as name
                FROM (orders NATURAL JOIN order_detail) LEFT JOIN payment USING (payment_id)
                WHERE (createdAt BETWEEN '${date1}' AND '${date2}') AND (${this.#db.escapeId(category)} LIKE '%${searchWord}%')
                ORDER BY createdAt DESC
                LIMIT ${amountOfSendData} OFFSET ${prevPage}`)
      .then((result) => result[0]);
  };

  getNewOrderAndNewRefund = async () => {
    return this.#db
      .execute(`SELECT status, count(*) as number 
                FROM (SELECT * 
                      FROM order_detail
                      WHERE status="반품및취소요청" OR status="결제완료" 
                      GROUP BY order_id)a 
                GROUP BY status`)
      .then((result) => result[0]);
  };

  getDeliveryStatus = async (detail_id) => {
    return this.#db
      .execute(`SELECT status, DATE_FORMAT(date, "%Y-%m-%d")AS "date" 
                FROM deliverystatus 
                WHERE detail_id=?`, [detail_id])
      .then((result) => result[0]);
  };
  
  updateOrderStatus = async (detail_id, status, after14days) => {
    let conn;

    try {
      conn = await this.#db.getConnection();
      await conn.beginTransaction();

      const query1 = conn.execute(
        `UPDATE order_detail SET status=?, refund_deadline=? WHERE detail_id=?`, [
          status, 
          after14days, 
          detail_id
        ]);

      const query2 = conn.execute(
        `INSERT INTO deliverystatus (status, date, detail_id) VALUES (?, ?, ?)`, [
          status, 
          new Date(), 
          detail_id
        ]);

      const results = await Promise.all([query1, query2]);

      await conn.commit();
      return;
    } catch (error) {
      await conn.rollback();
      throw new Error(error);
    } finally {
      conn.release();
    }
  };
}
