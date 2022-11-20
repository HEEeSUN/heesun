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

  getPendingRefundList = async (amountOfSendData, prevPage) => {
    return this.#db
      .execute(`SELECT *, count(*) OVER() as full_count 
                FROM refund
                WHERE refundProductPrice !=0
                ORDER BY refundId DESC
                LIMIT ${amountOfSendData} OFFSET ${prevPage}`)
      .then((result) => result[0]);
  };

  getPendingRefund = async (min, max) => {
    return this.#db
      .execute(`SELECT product_name, paymentOption, price, deliverystatus, quantity, merchantUID, orderer,phone, address, extra_address, detail_id, amount, refund_amount,rest_refund_amount, shippingfee, return_shippingfee, imp_uid, refundStatus, refundId 
      FROM orders natural join (
                  SELECT * 
                  FROM order_detail LEFT JOIN (
                      SELECT status AS deliverystatus, detail_id
                      FROM deliverystatus 
                      WHERE deliverystatus_id IN ( 
                        SELECT MAX(deliverystatus_id) 
                        FROM deliverystatus 
                        GROUP BY detail_id))A
                              USING(detail_id)
                  WHERE refundId BETWEEN ${min} AND ${max})B LEFT JOIN payment USING (payment_id)`)
      .then((result) => result[0]);
  };

  getSavePointBeforeRefund = async (merchantUID, refundId) => {
    let conn;

    try {
      conn = await this.#db.getConnection();
      await conn.beginTransaction();

      //paymentInfo
      const query1 = conn.execute(
        `SELECT products_price, shippingfee, rest_refund_amount, refund_amount, return_shippingfee, pending_refund 
        FROM payment 
        WHERE merchantUID=?`, [
          merchantUID
        ])

      //orderDetailList
      const query2 = conn.execute(
        `SELECT detail_id, status, refundStatus
        FROM order_detail
        WHERE refundId=?`, [
          refundId
        ])

      //refundInfo 
      const query3 = conn.execute(
        `SELECT reflection, refundProductPrice, refundShippingFee
        FROM refund
        WHERE refundId=?`, [
          refundId
        ])

      const [result1, result2, result3] = await Promise.all([query1, query2, query3]);

      const beforePaymentInfo = result1[0][0];
      const beforeOrderDetailList = result2[0];
      const beforeRefundInfo = result3[0][0];

      await conn.commit();
      
      return {beforePaymentInfo, beforeOrderDetailList, beforeRefundInfo}
    } catch (error) {
      console.log(error);
      await conn.rollback();
      throw new Error(error);
    } finally {
      conn.release();
    }
  };

  refund = async (
    allRefund,
    detailId,
    realRefundProducts,
    realRefundShippingFee,
    merchantUID,
    refundId,
    reflection
  ) => {
    let conn;

    try {
      conn = await this.#db.getConnection();
      await conn.beginTransaction();

      const query1 = conn.execute(
        `UPDATE payment SET products_price=products_price-${realRefundProducts}, shippingfee=shippingfee-${realRefundShippingFee}, rest_refund_amount=rest_refund_amount-${
          realRefundProducts + realRefundShippingFee
        }, refund_amount=refund_amount+${
          realRefundProducts + realRefundShippingFee
        }, pending_refund=pending_refund-${realRefundProducts} WHERE merchantUID=?`,
        [merchantUID]
      );

      const query2 = async () => {
        for (let i = 0; i < detailId.length; i++) {
          await conn.execute(
            `INSERT INTO deliverystatus (status, date, detail_id) VALUES (?, ?, ?)`, [
              "반품및취소완료", 
              new Date(), 
              detailId[i]
          ]);
        }
      };
      // if (allRefund) {
      //   query3 = conn.execute(
      //     `UPDATE order_detail SET status=?, refundStatus=? WHERE refundId=?`, [
      //       "반품및취소완료", 
      //       "complete", 
      //       refundId
      //     ]);

      // } else {
      //   query3 = async () => {
      //     for (let i = 0; i < detailId.length; i++) {
      //       await conn.execute(
      //         `UPDATE order_detail SET status=?, refundStatus=? WHERE detail_id=?`, [
      //           "반품및취소완료", 
      //           "complete", 
      //           detailId[i]
      //         ]);
      //     }
      //   };
      // }

      const query3 = async () => {
        for (let i = 0; i < detailId.length; i++) {
          await conn.execute(
            `UPDATE order_detail SET status=?, refundStatus=? WHERE detail_id=?`, [
              "반품및취소완료", 
              "complete", 
              detailId[i]
            ]);
        }
      }

      let query4;
      if (reflection) {
        query4 = conn.execute(
          `UPDATE refund SET reflection=${reflection}, refundProductPrice=refundProductPrice-${realRefundProducts}, refundShippingFee=refundShippingFee-${realRefundShippingFee} WHERE refundID=?`, [
            refundId
          ]);
      } else {
        query4 = conn.execute(
          `UPDATE refund SET refundProductPrice=refundProductPrice-${realRefundProducts}, refundShippingFee=refundShippingFee-${realRefundShippingFee} WHERE refundID=?`, [
            refundId
          ]);
      }

      await Promise.all([query1, query2(), query3(), query4]);

      await conn.commit();
      return;
    } catch (error) {
      console.log(error);
      await conn.rollback();
      throw new Error(error);
    } finally {
      conn.release();
    }
  };

  refundFail = async (
    merchantUID,
    paymentInfo,
    orderDetailList,
    refundInfo
  ) => {
    let conn;

    try {
      conn = await this.#db.getConnection();
      await conn.beginTransaction();
      
      const query1 = conn.execute(
        `UPDATE payment SET products_price=?, shippingfee=?, rest_refund_amount=?, refund_amount=?, return_shippingfee=?, pending_refund=? WHERE merchantUID=?`,
        [
          paymentInfo.products_price,
          paymentInfo.shippingfee,
          paymentInfo.rest_refund_amount,
          paymentInfo.refund_amount,
          paymentInfo.return_shippingfee,
          paymentInfo.pending_refund,
          merchantUID
        ]
      );

      const query2 = async () => {
        for (let i = 0; i < orderDetailList.length; i++) {
          await conn.execute(
            `DELETE FROM deliverystatus WHERE detail_id=? and status =?`, [
              orderDetailList[i].detail_id,
              "반품및취소완료"
            ]);
        }
      };

      const query3 = async () => {
        for (let i = 0; i < orderDetailList.length; i++) {
          await conn.execute(
            `UPDATE order_detail SET status=?, refundStatus=? WHERE detail_id=?`, [
              orderDetailList[i].status,
              orderDetailList[i].refundStatus,
              orderDetailList[i].detail_id
            ]);
        }
      };

      const query4 = conn.execute(
        `UPDATE refund SET reflection=?, refundProductPrice=?, refundShippingFee=? WHERE refundId=?`, [
          refundInfo.reflection,
          refundInfo.refundProductPrice,
          refundInfo.refundShippingFee,
          refundInfo.refundID
        ]);

        await Promise.all([query1, query2(), query3(), query4]);
      
      await conn.commit();
      return;
    } catch (error) {
      console.log(error);
      await conn.rollback();
      throw new Error(error);
    } finally {
      conn.release();
    }
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
