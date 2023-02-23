export default class RefundRepository {
  #db;
  
  constructor(db) {
    this.#db = db;
  }

  getOrder = async (id) => {
    return this.#db
      .execute(
        `SELECT merchantUID, imp_uid, paymentOption, amount, products_price, shippingfee, orderer, phone, address, extra_address FROM payment JOIN orders USING(payment_id) WHERE order_id=?`, [
          id
        ])
      .then((result) => result[0][0]);
  };

  getRefundOrder = async (merchantUID) => {

  }
  
  getOrderDetailByOrderId = async (id) => {
    return this.#db
      .execute("SELECT * FROM order_detail WHERE order_id=?", [id])
      .then((result) => result[0]);
  };

  getOrderDetailByIds = async (detailIds) => {
    return this.#db
    .execute(`SELECT detail_id, status, price, quantity
              FROM order_detail
              WHERE detail_id IN (${detailIds})`)
    .then((result) => result[0]);
  }

  getPaymentInformation = async (merchantUID) => {
    return this.#db
    .execute(`SELECT  
                imp_uid,
                merchantUID,
                amount,
                products_price,
                shippingfee,
                paymentOption
              FROM payment WHERE merchantUID=?`, [merchantUID])
    .then((result) => result[0][0]);
  }

  getRefundInformation= async (merchantUID) => {
    return this.#db
    .execute(`SELECT IFNULL(SUM(amount),0) AS amount, IFNULL(SUM(productsPrice),0) AS productsPrice, IFNULL(SUM(shippingFee),0) AS shippingFee, 
              IFNULL(SUM(returnShippingFee),0) AS returnShippingFee, IFNULL(SUM(setOff),0) AS setOff, 
              IFNULL(SUM(extraPay),0) AS extraPay
              FROM (
                SELECT * FROM new_refund 
                WHERE merchantUID=?
                UNION
                SELECT * FROM pending_refund
                WHERE merchantUID=?)a`, [merchantUID, merchantUID])
    .then((result) => result[0][0]);
  }

  insertInfoForPayment = async (
    username,
    amount
  ) => {
    return this.#db
      .execute(`INSERT INTO payment (username, amount) VALUES (?, ?)`, [
          username, 
          amount
        ])
      .then((result) => result[0].insertId);
  };

  updateMarchantUID = async (id, merchantUID) => {
    return this.#db
    .execute(`UPDATE payment SET merchantUID =? WHERE payment_id=?`,[merchantUID, id])
    .then((result) => result[0]);
  };

  deletePaymentByPaymentId = async (paymentId) => {
    return this.#db
      .execute("DELETE FROM payment WHERE payment_id=?", [paymentId]);
  };

  refund = async (
    merchantUID, 
    refundAmountForProduct,
    refundAmountForShipping,
    newMerchantUID='',
    refundProduct
  ) => {
    let conn;

    try {
      conn = await this.#db.getConnection();
      await conn.beginTransaction();

      const result = await conn.execute(
        `INSERT INTO new_refund (merchantUID, amount, productsPrice, shippingFee, newMerchantUID) 
        VALUES (?, ?, ?, ?, ?)`,[
          merchantUID, 
          refundAmountForProduct+refundAmountForShipping,
          refundAmountForProduct,
          refundAmountForShipping,
          newMerchantUID
        ]);

      const query2 = async () => {
        for (let i = 0; i < refundProduct.length; i++) {
          conn.execute(
            `UPDATE order_detail SET status=?, refundStatus=? WHERE detail_id=?`, [
              "반품및취소완료", 
              "complete", 
              refundProduct[i].detail_id
            ]);

          conn.execute(
            `INSERT INTO temp_deliverystatus (refundId, detail_id, status) VALUES (?,?,?)`, [
              result[0].insertId,
              refundProduct[i].detail_id, 
              refundProduct[i].status
            ]);
        }
      }

      const results = await Promise.all([result, query2()]);

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

  pendingRefund = async (
    merchantUID, 
    pendingRefundAmountForProduct,
    pendingRefundAmountForShipping,
    returnShippingFee,
    prePayment,
    extraCharge,
    newMerchantUID,
    pendingRefundProduct
  ) => {
    let conn;

    try {
      conn = await this.#db.getConnection();
      await conn.beginTransaction();

      const result = await conn.execute(
        `INSERT INTO pending_refund (
          merchantUID, amount, productsPrice, shippingFee, returnShippingFee, setOff, extraPay, newMerchantUID) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,[
            merchantUID, 
            pendingRefundAmountForProduct+pendingRefundAmountForShipping,
            pendingRefundAmountForProduct,
            pendingRefundAmountForShipping,
            returnShippingFee,
            prePayment,
            extraCharge,
            newMerchantUID || ''
          ]);

      const query2 = async () => {
        for (let i = 0; i < pendingRefundProduct.length; i++) {
          await conn.execute(
            `UPDATE order_detail SET status=?, refundStatus=? WHERE detail_id=?`, [
              "반품및취소요청", 
              "waiting", 
              pendingRefundProduct[i].detail_id
            ]);

            await conn.execute(
            `INSERT INTO temp_deliverystatus (pendingRefundId, detail_id, status) VALUES (?,?,?)`, [
              result[0].insertId,
              pendingRefundProduct[i].detail_id, 
              pendingRefundProduct[i].status
            ]);
        }
      }

      const results = await Promise.all([result, query2()]);

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

  deleteRefundId = async (refundId) => {
    return this.#db
    .execute(`DELETE FROM new_refund WHERE refundId=?`,[
      refundId,
    ]);
  }

  updatePayment = async (imp_uid, merchant_uid) => {
    return this.#db
      .execute("UPDATE payment SET imp_uid=? WHERE merchantUID=?", [
        imp_uid,
        merchant_uid,
      ]);
  };

  getRefundId = async (newMerchantUID) => {
    return this.#db
    .execute(`SELECT id FROM new_refund where newMerchantUID=?)`,[newMerchantUID])
    .then((result) => result[0][0]);
  }
  
  getPendingRefundId = async (newMerchantUID) => {
    return this.#db
    .execute(`SELECT id FROM pending_refund where newMerchantUID=?)`,[newMerchantUID])
    .then((result) => result[0][0]);
  }
    
  failedPayment = async (newMerchantUID) => {
    return this.#db
    .execute(`DELETE FROM payment where merchantUID=?)`,[newMerchantUID])
    .then((result) => result[0]);
  }

  getTempDeliverystatus = async (refundId, pendingRefundId) => {
    return this.#db
    .execute(`SELECT detail_id, status FROM temp_deliverystatus WHERE refundId=? OR pendingRefundId=?`,[
      refundId || '',
      pendingRefundId || ''
    ])
    .then((result) => result[0]);
  }
  
  failedRefund = async (refundId, pendingRefundId, tempStatus) => {
    let conn;

    try {
      conn = await this.#db.getConnection();
      await conn.beginTransaction();

      for (let i = 0; i < tempStatus.length; i++) {
        await conn.execute(
          `UPDATE order_detail SET status=?, refundStatus=? WHERE detail_id=?`, [
            tempStatus[i].status, 
            "", 
            tempStatus[i].detail_id
          ]);
      }

      const query1 = await conn.execute(`DELETE FROM new_refund WHERE refundId=?`,[refundId || 0]);
      const query2 = await conn.execute(`DELETE FROM pending_refund WHERE pendingRefundId=?`,[pendingRefundId || 0]);

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

  findPaymentId = async (id) => {
    // 환불 관련 추가 결제시.... > 나중에 별도의 payment table 생성 예정
    return this.#db
      .execute(`SELECT payment_id FROM orders WHERE order_id=?`, [id])
      .then((result) => result[0][0].payment_id);
  };

  cancelOrder = async (paymentId, orderId) => {
    let conn;

    try {
      conn = await this.#db.getConnection();
      await conn.beginTransaction();

      const query1 = conn.execute(
        `UPDATE order_detail SET status='주문취소' WHERE order_id=?`,
        [orderId]
      );
      const query2 = conn.execute(
        "UPDATE payment SET amount=0, shippingfee=0, products_price=0 WHERE payment_id=?",
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
  };



  // admin
  getPendingRefundList = async (amountOfSendData, prevPage) => {
    return this.#db
      .execute(`SELECT pendingRefundId, merchantUID, product_name, count, COUNT(*) OVER() AS fullCount  
                FROM order_detail A, (
                  SELECT *, COUNT(detail_id) AS count 
                  FROM temp_deliverystatus JOIN pending_refund 
                  USING(pendingRefundId) 
                  GROUP BY pendingRefundId)B 
                WHERE A.detail_id=B.detail_id
                LIMIT ${amountOfSendData} OFFSET ${prevPage}`)
      .then((result) => result[0]);
  };
  
  getRefundDetailPayInfo = async (refundId) => {
  return this.#db
  .execute(`SELECT *
            FROM ((
                SELECT payment_id, merchantUID, amount AS payAmount, imp_uid, paymentOption 
                FROM payment)A 
              JOIN (
                SELECT payment_id, orderer, address, extra_address, phone from orders)B
              USING(payment_id)
            ) JOIN ((
                    SELECT * 
                    FROM pending_refund 
                    WHERE pendingRefundId=?)D 
                  LEFT JOIN (
                    SELECT merchantUID, IFNULL(SUM(amount),0) AS pastAmount
                    FROM new_refund
                    GROUP BY merchantUID)E
                  USING(merchantUID)
                )
              USING(merchantUID)`,[refundId])
  .then((result) => result[0][0]);

  }
  getPendingRefundDetail = async (refundId) => {
    // return this.#db
    //   .execute(`SELECT A.detail_id, product_name, price, quantity, B.status AS deliverystatus 
    //           FROM order_detail A, 
    //             (SELECT * 
    //             FROM temp_deliverystatus JOIN (
    //               SELECT pendingRefundId 
    //               FROM pending_refund 
    //               WHERE pendingRefundId=?)C
    //             USING(pendingRefundId))B 
    //           WHERE a.detail_id=b.detail_id`,[refundId])
    //   .then((result) => result[0]);
    return this.#db
      .execute(`
        SELECT detail_id, product_name, price, quantity, A.status AS deliverystatus 
        FROM order_detail JOIN(
          SELECT * 
          FROM temp_deliverystatus 
          WHERE pendingRefundId=?)A
        USING (detail_id)`,[refundId])
      .then((result) => result[0]);
  };

  getAPendingRefund = async (refundId) => {
    return this.#db
    .execute(`
      SELECT * 
      FROM (
        (SELECT merchantUID, imp_uid 
        FROM payment)B  
          JOIN
        (SELECT *
        FROM pending_refund
        WHERE pendingRefundId=?)A
      USING(merchantUID)
      );`,[refundId])
    .then((result) => result[0][0]);
  }

  fullRefund = async (pendingRefundId, pendingRefund, detailId) => {
    let conn;

    try {
      conn = await this.#db.getConnection();
      await conn.beginTransaction();

      const query1 = await conn.execute(
        `INSERT INTO new_refund (merchantUID, amount, productsPrice, shippingFee, returnShippingFee, setOff, extraPay, newMerchantUID)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
          pendingRefund.merchantUID,
          pendingRefund.amount, 
          pendingRefund.productsPrice, 
          pendingRefund.shippingFee, 
          pendingRefund.returnShippingFee, 
          pendingRefund.setOff, 
          pendingRefund.extraPay, 
          pendingRefund.newMerchantUID
        ]
      );
      const query2 = conn.execute(`
        DELETE FROM pending_refund WHERE pendingRefundId = ?`,[pendingRefundId]
      );
      
      const query3 = async () => {
        for (let i = 0; i < detailId.length; i++) {
          conn.execute(
            `UPDATE order_detail SET status=?, refundStatus=? WHERE detail_id=?`, [
              "반품및취소완료", 
              "complete", 
              detailId[i]
            ]);
          conn.execute(
            `UPDATE temp_deliverystatus SET refundId=?, pendingRefundId=? WHERE detail_id=?`, [
              query1[0].insertId,
              null,
              detailId[i]
            ]);
        }
      }
      const results = await Promise.all([query1, query2, query3()]);

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

  partialRefund = async (pendingRefundId, pendingRefund, detailId, refundInfo) => {
    let conn;

    try {
      conn = await this.#db.getConnection();
      await conn.beginTransaction();

      const query1 = await conn.execute(
        `INSERT INTO new_refund (merchantUID, amount, productsPrice, shippingFee, returnShippingFee, setOff, extraPay, newMerchantUID)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
          pendingRefund.merchantUID,
          refundInfo.refundAmount, 
          refundInfo.realRefundProducts, 
          refundInfo.realRefundShippingFee, 
          refundInfo.realReturnShippingFee, 
          refundInfo.setOff, 
          refundInfo.extraPay, 
          pendingRefund.newMerchantUID
        ]
      );
      const query2 = conn.execute(`
        UPDATE pending_refund SET amount=amount-${refundInfo.refundAmount},
        productsPrice=productsPrice-${refundInfo.realRefundProducts},
        shippingFee=shippingFee-${refundInfo.realRefundShippingFee},
        returnShippingFee=returnShippingFee-${refundInfo.realReturnShippingFee},
        setOff=setOff-${refundInfo.setOff},
        extraPay=extraPay-${refundInfo.extraPay}
        WHERE pendingRefundId= ?`,[pendingRefundId]
      );
      
      const query3 = async () => {
        for (let i = 0; i < detailId.length; i++) {
          conn.execute(
            `UPDATE order_detail SET status=?, refundStatus=? WHERE detail_id=?`, [
              "반품및취소완료", 
              "complete", 
              detailId[i]
            ]);
          conn.execute(
            `UPDATE temp_deliverystatus SET refundId=?, pendingRefundId=? WHERE detail_id=?`, [
              query1[0].insertId,
              null,
              detailId[i]
            ]);
        }
      }
      const results = await Promise.all([query1, query2, query3()]);

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

  faileFullRefund = async (refundId, pendingRefund, detailId) => {
    let conn;

    try {
      conn = await this.#db.getConnection();
      await conn.beginTransaction();

      const query1 = conn.execute(
        `DELETE FROM new_refund WHERE refundId=?`,[refundId]
      );

      const query2 = await conn.execute(
        `INSERT INTO pending_refund (merchantUID, amount, productsPrice, shippingFee, returnShippingFee, setOff, extraPay, newMerchantUID)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
          pendingRefund.merchantUID,
          pendingRefund.amount, 
          pendingRefund.productsPrice, 
          pendingRefund.shippingFee, 
          pendingRefund.returnShippingFee, 
          pendingRefund.setOff, 
          pendingRefund.extraPay, 
          pendingRefund.newMerchantUID
        ]
      );
      
      const query3 = async () => {
        for (let i = 0; i < detailId.length; i++) {
          conn.execute(
            `UPDATE order_detail SET status=?, refundStatus=? WHERE detail_id=?`, [
              "반품및취소요청", 
              "waiting", 
              detailId[i]
            ]);
          conn.execute(
            `UPDATE temp_deliverystatus SET refundId=?, pendingRefundId=? WHERE detail_id=?`, [
              null,
              query2[0].insertId,
              detailId[i]
            ]);
        }
      }
      const results = await Promise.all([query1, query2, query3()]);

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

  failedPartialRefund = async (refundId, pendingRefundId, detailId) => {
    let conn;

    try {
      conn = await this.#db.getConnection();
      await conn.beginTransaction();

      const query1 = conn.execute(
        `DELETE FROM new_refund WHERE refundId=?`,[refundId]
      );

      const query2 = conn.execute(
        `UPDATE pending_refund SET amount=?, productsPrice=?, shippingFee=?, returnShippingFee=?, setOff=?, extraPay=?)
        VALUES (?, ?, ?, ?, ?, ?)`, [
          pendingRefund.amount, 
          pendingRefund.productsPrice, 
          pendingRefund.shippingFee, 
          pendingRefund.returnShippingFee, 
          pendingRefund.setOff, 
          pendingRefund.extraPay
        ]
      );
      
      const query3 = async () => {
        for (let i = 0; i < detailId.length; i++) {
          conn.execute(
            `UPDATE order_detail SET status=?, refundStatus=? WHERE detail_id=?`, [
              "반품및취소요청", 
              "waiting", 
              detailId[i]
            ]);
          conn.execute(
            `UPDATE temp_deliverystatus SET refundId=?, pendingRefundId=? WHERE detail_id=?`, [
              null,
              pendingRefundId,
              detailId[i]
            ]);
        }
      }
      const results = await Promise.all([query1, query2, query3()]);

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
}
