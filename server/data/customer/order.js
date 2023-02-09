export default class UserOrderRepository {
  #db;
  
  constructor(db) {
    this.#db = db;
  }

  getUserInfo = async (username) => {
    return this.#db
      .execute(`
        SELECT name, phone, email, address, extra_address 
        FROM users 
        WHERE username=?`, [username])
      .then((result) => result[0][0]);
  };

  checkStockBeforeOrder = async (today, product) => {
    return this.#db.execute(`
      SELECT product_code, option_number, name, price, main_img_src, description, option1, option2, stock, sale_price
      FROM (product NATURAL JOIN product_option) LEFT JOIN (
        SELECT * 
        FROM sale_product LEFT JOIN time_sale_table
        USING(time_id)
        where time_id is null or start <= ? and end >= ?
      )A
      USING(product_code, option_number)
      WHERE disabled is not true AND product_code=? AND name=? AND option_number=? AND option1=? AND option2=?`,[
        today,
        today,
        product.product_code,
        product.name,
        product.option_number,
        product.option1,
        product.option2,
      ])
    .then((result) => result[0][0])
  };

  insertInfoForPayment = async (
    username,
    amount,
    shippingFee,
    productPrice,
    paymentOption
  ) => {
    return this.#db
      .execute(`
        INSERT INTO payment (username, amount, shippingfee, products_price, paymentOption) 
        VALUES (?, ?, ?, ?, ?)`, [
          username, 
          amount, 
          shippingFee, 
          productPrice, 
          paymentOption
        ])
      .then((result) => result[0].insertId);
  };

  updateMarchantUID = async (id, merchantUID) => {
    return this.#db
    .execute(`
      UPDATE payment SET merchantUID=? 
      WHERE payment_id=?`, [merchantUID, id])
    .then((result) => result[0]);
  };

  deletePaymentByPaymentId = async (paymentId) => {
    return this.#db
      .execute("DELETE FROM payment WHERE payment_id=?", [paymentId]);
  };

  deletePaymentByMerchantUID = async (merchantUID) => {
    return this.#db
      .execute("DELETE FROM payment WHERE merchantUID=?", [merchantUID]);
  };

  order = async (
    username,
    paymentId,
    orderer,
    phone,
    address,
    extra_address
  ) => {
    return this.#db
      .execute(`
        INSERT INTO orders (username, createdAt, payment_id, orderer, phone, address, extra_address) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`, [
          username,
          new Date(),
          paymentId,
          orderer,
          phone,
          address,
          extra_address,
        ])
      .then((result) => result[0].insertId);
  };

  orderDetail = async (status, orderId, orderArray) => {
    let conn;

    try {
      conn = await this.#db.getConnection();
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

        const query1 = conn.execute(`
          INSERT INTO order_detail (order_id, product_code, product_name, option1, option2, quantity, price, main_img_src, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            orderId,
            product_code,
            name,
            option1,
            option2,
            quantity,
            sale_price || price,
            main_img_src,
            status,
          ]);

        const query2 = conn.execute(`
          UPDATE product_option SET stock = stock-${quantity} 
          WHERE product_code=? AND option_number=?`, [
            product_code, 
            option_number
          ]);

        const query3 = conn.execute("DELETE FROM cart WHERE cart_id=?", [cart_id]);

        const results = await Promise.all([query1, query2, query3]);

        await conn.execute(`
          INSERT INTO deliverystatus (status, date, detail_id) 
          VALUES (?, ?, ?)`, [
            status, new Date(), 
            results[0][0].insertId
          ]);
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
  };

  updatePayment = async (imp_uid, merchant_uid) => {
    return this.#db
      .execute("UPDATE payment SET imp_uid=? WHERE merchantUID=?", [
        imp_uid,
        merchant_uid,
      ]);
  };
  
  getPaymentIdAndOrderId = async (merchantUID) => {
    return this.#db
      .execute(`
        SELECT payment_id, order_id 
        FROM payment NATURAL JOIN orders 
        WHERE merchantUID=?`, [merchantUID])
      .then((result) => result[0][0]);
  }

  getOrder = async (username, date1, date2, amountOfSendData, prevPage) => {
    return this.#db
      .execute(`
        SELECT order_id, count(*) OVER() AS full_count, DATE_FORMAT(createdAt, "%Y-%m-%d")AS "created" 
        FROM orders 
        WHERE username=? AND createdAt BETWEEN '${date1}' AND '${date2}' 
        ORDER BY createdAt DESC
        LIMIT ${amountOfSendData} OFFSET ${prevPage}`, [username])
      .then((result) => result[0]);
  };

  getOrderDetail = async (id) => {
    return this.#db
      .execute("SELECT * FROM order_detail WHERE order_id=?", [id])
      .then((result) => result[0]);
  };

  increaseStock = async (newArray) => {
    let conn;

    try {
      conn = await this.#db.getConnection();
      await conn.beginTransaction();

      let products = [];

      for (let i = 0; i < newArray.length; i++) {
        const product = await conn.execute(`
          SELECT option_number 
          FROM product_option 
          WHERE product_code=? AND option1=? AND option2=?`,[
            newArray[i].product_code,
            newArray[i].option1, 
            newArray[i].option2
          ]);

          if (product[0][0].option_number || product[0][0].option_number == 0) {
            await conn.execute(`
            UPDATE product_option SET stock = stock+${newArray[i].quantity} 
            WHERE product_code=? AND option_number=?`,[
                newArray[i].product_code, 
                product[0][0].option_number
              ]);

            products[products.length] = {
              product_code: newArray[i].product_code,
              option_number: product[0][0].option_number,
              quantity: newArray[i].quantity
            } 
          }
      }

      await conn.commit();
      return products;
    } catch (error) {
      console.log(error);
      await conn.rollback();
      throw new Error(error);
    } finally {
      conn.release();
    }
  };

  getOrderId = async (merchantUID) => {
    return this.#db
      .execute(`
        SELECT order_id 
        FROM payment NATURAL JOIN orders 
        WHERE merchantUID=?`, [merchantUID])
      .then((result) => result[0][0]);
  }

  getRefundOrder = async (id) => {
    return this.#db
      .execute(`
        SELECT * 
        FROM payment JOIN orders 
        USING(payment_id) 
        WHERE order_id=?`, [id])
      .then((result) => result[0][0]);
  };

  getQuantityInCart = async (userId) => {
    return this.#db
      .execute(`
        SELECT count(cart_id) as quantity 
        FROM cart 
        WHERE userId=?`, [userId])
      .then((result) => result[0][0]);
  };

  upgradeClass = async (username, className) => {
    return this.#db
      .execute(`UPDATE users SET class=? WHERE username=?`, [
        className,
        username,
      ]);
  };

  addInCart = async (product_code, option_number, quantity, userId) => {
    return this.#db
      .execute(`
        INSERT INTO cart (product_code, option_number, quantity, userId) 
        VALUES (?, ?, ?, ?)`, [
        product_code, 
        option_number, 
        quantity, 
        userId
      ])
      .then((result) => result[0].insertId);
  };
}
