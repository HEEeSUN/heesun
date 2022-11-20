export default class AdminOrderRepository {
  #db

  constructor(db) {
    this.#db = db;
  }

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

  addProduct = async (
    product_code,
    name,
    price,
    cost,
    imgFileSrc,
    description,
    options
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
        for (let i = 0; i < options.length; i++) {
          conn.execute(
            `INSERT INTO product_option (product_code, option_number, option1, option2, stock) VALUES (?, ?, ?, ?, ?)`, [
              product_code,
              i,
              options[i].option1,
              options[i].option2,
              options[i].stock,
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

  deleteProduct = async (code) => {
    return this.#db
      .execute(`DELETE FROM product WHERE product_code=?`, [code])
      .then((result) => result[0].affectedRows);
  };
}
