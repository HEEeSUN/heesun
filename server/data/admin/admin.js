export default class AdminRepository {
  #db

  constructor(db) {
    this.#db = db;
  }

  findByUsername = async (admin) => {
    return this.#db
      .execute(`SELECT * FROM admin WHERE username=?`, [admin])
      .then((result) => result[0][0]);
  };

  findById = async (admin) => {
    return this.#db
      .execute(`SELECT * FROM admin WHERE id=?`, [admin])
      .then((result) => result[0][0]);
  };

  getMenuList = async (admin) => {
    return this.#db
      .execute(`SELECT * 
                FROM access_authority NATURAL JOIN admin_menu_list 
                WHERE id=?`, [admin])
      .then((result) => result[0]);
  };

  createAdmin = async (admin, password) => {
    return this.#db
      .execute(`INSERT INTO admin (username, password) VALUES (?, ?)`, [
        admin,
        password,
      ])
      .then((result) => result[0].insertId);
  };

  grantAuthority = async (admin_id, menuList) => {
    let conn;

    try {
      conn = await this.#db.getConnection();
      await conn.beginTransaction();

      for (let i = 0; i < menuList.length; i++) {
        await conn.execute(
          `INSERT INTO access_authority (id, menu_id) VALUES (?, ?)`, [
            admin_id, 
            menuList[i]
          ]);
      }

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

  findByProductCode = async (product_code) => {
    return this.#db
      .execute(`SELECT * FROM product WHERE product_code=?`, [product_code])
      .then((result) => result[0][0]);
  };

  getProductOptionByCode = async (id) => {
    return this.#db
      .execute(`SELECT * FROM product_option WHERE product_code=?`, [id])
      .then((result) => result[0]);
  };

  updateProduct = async (
    product_code,
    name,
    price,
    cost,
    description,
    imgFileSrc,
    optionList
  ) => {
    let conn;

    try {
      conn = await this.#db.getConnection();
      await conn.beginTransaction();

      const query1 = conn.execute(
        `UPDATE product SET name=?, price=?, cost=?, description=?, main_img_src=? WHERE product_code=?`, [
          name, 
          price, 
          cost, 
          description, 
          imgFileSrc, 
          product_code
        ]);

      const query2 = conn.execute(
        "DELETE FROM product_option WHERE product_code=?", [
          product_code
        ]);

      await Promise.all([query1, query2]);

      for (let i = 0; i < optionList.length; i++) {
        await conn.execute(
          `INSERT INTO product_option (product_code, option_number, option1, option2, stock, disabled) VALUES (?, ?, ?, ?, ?, ?)`, [
            product_code,
            i,
            optionList[i].option1,
            optionList[i].option2,
            optionList[i].stock,
            optionList[i].disabled,
          ]);
      }

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

  addProduct = async (
    product_code,
    name,
    price,
    cost,
    imgFileSrc,
    description,
    products
  ) => {
    let conn;

    try {
      conn = await this.#db.getConnection();
      await conn.beginTransaction();

      const query1 = conn.execute(
        `INSERT INTO product (product_code, name, price, cost, main_img_src, description, createdAt) VALUES (?, ?, ?, ?, ?, ?,? )`, [
          product_code, 
          name, 
          price, 
          cost, 
          imgFileSrc, 
          description, 
          new Date()
        ]);

      const query2 = async () => {
        for (let i = 0; i < products.length; i++) {
          conn.execute(
            `INSERT INTO product_option (product_code, option_number, option1, option2, stock) VALUES (?, ?, ?, ?, ?)`, [
              product_code,
              i,
              products[i].option1,
              products[i].option2,
              products[i].stock,
            ]);
        }
      };

      await Promise.all([query1, query2()]);

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

  deleteProduct = async (code) => {
    return this.#db
      .execute(`DELETE FROM product WHERE product_code=?`, [code])
      .then((result) => result[0].affectedRows);
  };

  getAllProductWithOption = async (amountOfSendData, prevPage) => {
    return this.#db
      .execute(`SELECT *, count(*) OVER() AS full_count 
                FROM (product NATURAL JOIN product_option) LEFT JOIN (
                  SELECT * 
                  FROM sale_product LEFT JOIN time_sale_table
                  USING(time_id)
                )A
                USING(product_code, option_number)
                LIMIT ${amountOfSendData} OFFSET ${prevPage}`)
      .then((result) => result[0]);
  };

  getProductWithOptionByTxt = async (search, amountOfSendData, prevPage) => {
    return this.#db
      .execute(`SELECT *, count(*) OVER() AS full_count
                FROM (product NATURAL JOIN product_option) LEFT JOIN (
                  SELECT * 
                  FROM sale_product LEFT JOIN time_sale_table
                  USING(time_id)
                )A
                USING(product_code, option_number)
                WHERE name LIKE '%${search}%' OR product_code LIKE '%${search}%' ORDER BY product_code
                LIMIT ${amountOfSendData} OFFSET ${prevPage}`)
      .then((result) => result[0]);
  };

  getProductWithOptionByCatAndTxt = async (
    category,
    search,
    amountOfSendData,
    prevPage
  ) => {
    return this.#db
      .execute(`SELECT *, count(*) OVER() AS full_count
                FROM (product NATURAL JOIN product_option) LEFT JOIN (
                  SELECT * 
                  FROM sale_product LEFT JOIN time_sale_table
                  USING(time_id)
                )A
                USING(product_code, option_number)
                WHERE ${this.#db.escapeId(category)} LIKE '%${search}%' 
                ORDER BY product_code
                LIMIT ${amountOfSendData} OFFSET ${prevPage}`)
      .then((result) => result[0]);
  };

  addSaleProduct = async (productList) => {
    let conn;

    try {
      conn = await this.#db.getConnection();
      await conn.beginTransaction();

      for (let i = 0; i < productList.length; i++) {
        await conn.execute(
          `INSERT INTO sale_product (product_code, option_number, sale_price) VALUES (?, ?, ?)`, [
            productList[i].product_code,
            productList[i].option_number,
            productList[i].sale_price,
          ]);
      }
      await conn.commit();
      return;
    } catch (error) {
      await conn.rollback();
      throw new Error(error);
    } finally {
      conn.release();
    }
  };

  updateSaleProduct = async (changeList, deleteList) => {
    let conn;

    try {
      conn = await this.#db.getConnection();
      await conn.beginTransaction();

      const query1 = async () => {
        for (let i = 0; i < changeList.length; i++) {
          conn.execute(`UPDATE sale_product SET sale_price=? WHERE sale_id=?`, [
            changeList[i].change_price,
            changeList[i].sale_id,
          ]);
        }
      };

      const query2 = async () => {
        for (let i = 0; i < deleteList.length; i++) {
          await conn.execute(`DELETE FROM sale_product WHERE sale_id=?`, [
            deleteList[i],
          ]);
        }
      };

      const results = await Promise.all([query1(), query2()]);

      await conn.commit();
      return;
    } catch (error) {
      await conn.rollback();
      throw new Error(error);
    } finally {
      conn.release();
    }
  };

  deleteTimeSale = async (timeId) => {
    return this.#db
      .execute(`DELETE FROM time_sale_table WHERE time_id=?`, [timeId]);
  };

  deleteSaleProduct = async () => {
    return this.#db
      .execute(`DELETE FROM sale_product WHERE time_id IS NULL`);
  };

  addSaleProductAndTIme = async (productList, saleStartTime, saleEndTime) => {
    let conn;

    try {
      conn = await this.#db.getConnection();
      await conn.beginTransaction();

      const result = await conn.execute(
        `INSERT INTO time_sale_table (start, end) VALUES (?, ?)`, [
          saleStartTime, 
          saleEndTime
        ]);

      for (let i = 0; i < productList.length; i++) {
        await conn.execute(
          `INSERT INTO sale_product (product_code, option_number, sale_price, time_id) VALUES (?, ?, ?, ?)`, [
            productList[i].product_code,
            productList[i].option_number,
            productList[i].sale_price,
            result[0].insertId,
          ]);
      }

      await conn.commit();
      return;
    } catch (error) {
      await conn.rollback();
      throw new Error(error);
    } finally {
      conn.release();
    }
  };

  getSaleTimeTable = async () => {
    return this.#db
      .execute(`SELECT time_id FROM time_sale_table ORDER BY end desc`)
      .then((result) => result[0]);
  };

  getSaleProducts = async () => {
    return this.#db
      .execute(`SELECT * 
                FROM (product NATURAL JOIN product_option) LEFT JOIN (
                  sale_product LEFT JOIN time_sale_table 
                  USING(time_id)
                )
                USING(product_code, option_number)
                WHERE sale_id is not null`)
      .then((result) => result[0]);
  };

  getSaleProductsAfterUpdate = async (timeId = undefined) => {
    if (timeId) {
      return this.#db
        .execute(`SELECT * 
                  FROM (product NATURAL JOIN product_option) LEFT JOIN (sale_product NATURAL JOIN time_sale_table)
                  USING(product_code, option_number)
                  WHERE time_id=?`, [timeId])
        .then((result) => result[0]);
    } else {
      return this.#db
        .execute(`SELECT * 
                  FROM (product NATURAL JOIN product_option) LEFT JOIN (
                    sale_product LEFT JOIN time_sale_table 
                    USING(time_id)
                  )
                  USING(product_code, option_number)
                  WHERE sale_id is not null AND time_id is null`)
        .then((result) => result[0]);
    }
  };

  getAllProduct = async (amountOfSendData, prevPage) => {
    return this.#db
      .execute(`SELECT product_code, name, price, main_img_src, description, cost, count(*) OVER() AS full_count 
                FROM product
                LIMIT ${amountOfSendData} OFFSET ${prevPage}`)
      .then((result) => result[0]);
  };

  getProductByTxt = async (search, amountOfSendData, prevPage) => {
    return this.#db
      .execute(`SELECT product_code, name, price, main_img_src, description, cost, count(*) OVER() AS full_count  
                FROM product 
                WHERE name LIKE '%${search}%' OR product_code LIKE '%${search}%'
                LIMIT ${amountOfSendData} OFFSET ${prevPage}`)
      .then((result) => result[0]);
  };

  getProductByCatAndTxt = async (
    category,
    search,
    amountOfSendData,
    prevPage
  ) => {
    return this.#db
      .execute(`SELECT product_code, name, price, main_img_src, description, cost, count(*) OVER() AS full_count  
                FROM product 
                WHERE ${this.#db.escapeId(category)} LIKE '%${search}%'
                LIMIT ${amountOfSendData} OFFSET ${prevPage}`)
      .then((result) => result[0]);
  };

  getOrderBySpecificStatus = async (amountOfSendData, prevPage, status) => {
    return this.#db
      .execute(`SELECT createdAt, product_code, product_name, merchantUID, quantity, payment.username, status, detail_id, refundStatus, phone, address, extra_address,  count(*) OVER() AS full_count, DATE_FORMAT(createdAt, "%Y-%m-%d") AS "created", orderer as name
                FROM (orders NATURAL JOIN order_detail) LEFT JOIN payment USING (payment_id)
                WHERE order_detail.status='${status}'
                ORDER BY createdAt DESC
                LIMIT ${amountOfSendData} OFFSET ${prevPage}`)
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
      .execute(`SELECT product_name, price, quantity, merchantUID, orderer,phone, address, extra_address, detail_id, amount, refund_amount,rest_refund_amount, shippingfee, return_shippingfee, imp_uid, refundStatus, refundId  
                FROM (order_detail NATURAL JOIN orders) LEFT JOIN payment USING (payment_id)
                WHERE refundId BETWEEN ${min} AND ${max}
                ORDER BY createdAt DESC`)
      .then((result) => result[0]);
  };

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

  getNewOrder = async () => {
    return this.#db
      .execute(`SELECT COUNT(*) AS number FROM order_detail WHERE status=?`, [
        "결제완료",
      ])
      .then((result) => result[0][0]);
  };

  getNewRefund = async () => {
    return this.#db
      .execute(`SELECT COUNT(*) AS number FROM order_detail WHERE status=? GROUP BY refundId`, [
        "반품및취소요청"
      ])
      .then((result) => result[0]);
  };

  get6month = async (startDate, endDate) => {
    return this.#db
      .execute(`SELECT mid(merchantUID, 1, 6) month, sum(amount) sales, sum(rest_refund_amount) revenue, sum(refund_amount) refund, cost
                FROM (orders NATURAL JOIN (SELECT order_id, sum(cost) cost FROM order_detail NATURAL JOIN product GROUP BY order_id)b)
                JOIN payment USING(payment_id)
                WHERE mid(merchantUID, 1, 6) BETWEEN ${startDate} AND ${endDate}
                GROUP BY month`)
      .then((result) => result[0]);
  };

  getSalesQuantity = async (endDate) => {
    return this.#db
      .execute(`SELECT product_code, option1, option2, count(*) count
                FROM (orders NATURAL JOIN payment) NATURAL JOIN  order_detail
                WHERE mid(merchantUID, 1, 6) = '${endDate}'
                GROUP BY product_code, option1, option2`)
      .then((result) => result[0]);
  };

  getAllChattings = async () => {
    return this.#db
      .execute(`SELECT room_name FROM chat_list`)
      .then((result) => result[0]);
  };

  getNoReadMessage = async (roomname) => {
    return this.#db
      .execute(`SELECT COUNT(*) AS number 
                FROM ${this.#db.escapeId(roomname)} 
                WHERE uniqueId IS NOT null AND username !='master'`)
      .then((result) => result[0][0]);
  };

  refund = async (
    allRefund,
    detailId,
    realRefundProducts,
    realRefundShippingFee,
    merchantUID,
    refundId
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

      let query3;
      let query4;

      if (allRefund) {
        query3 = conn.execute(
          `UPDATE order_detail SET status=?, refundStatus=? WHERE refundId=?`, [
            "반품및취소완료", 
            "complete", 
            refundId
          ]);

        query4 = conn.execute(
          `DELETE FROM refund WHERE refundID=?`, [
            refundId,
          ]);

        await Promise.all([query1, query2(), query3, query4]);
      } else {
        query3 = async () => {
          for (let i = 0; i < detailId.length; i++) {
            await conn.execute(
              `UPDATE order_detail SET status=?, refundStatus=? WHERE detail_id=?`, [
                "반품및취소완료", 
                "complete", 
                detailId[i]
              ]);
          }
        };

        query4 = conn.execute(
          `UPDATE refund SET refundProductPrice=refundProductPrice-${realRefundProducts}, refundShippingFee=refundShippingFee-${realRefundShippingFee} WHERE refundID=?`, [
            refundId
          ]);

        await Promise.all([query1, query2(), query3(), query4]);
      }

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
}
