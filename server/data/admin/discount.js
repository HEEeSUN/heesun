export default class AdminDiscountRepository {
  #db

  constructor(db) {
    this.#db = db;
  }

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

  deleteSaleProduct = async () => {
    return this.#db
      .execute(`DELETE FROM sale_product WHERE time_id IS NULL`);
  };

  deleteTimeSale = async (timeId) => {
    return this.#db
      .execute(`DELETE FROM time_sale_table WHERE time_id=?`, [timeId]);
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

  /*
    getSalesQuantity = async (endDate) => {
      return this.#db
        .execute(`SELECT product_code, option1, option2, count(*) count
                  FROM (orders NATURAL JOIN payment) NATURAL JOIN  order_detail
                  WHERE mid(merchantUID, 1, 6) = '${endDate}'
                  GROUP BY product_code, option1, option2`)
        .then((result) => result[0]);
    };
  */
}
