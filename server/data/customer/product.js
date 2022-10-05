export default class ProductRepository {
  #db;

  constructor(db) {
    this.#db = db;
  }

  getByProduct_code = async (product_code, today) => {
    return this.#db
      .execute(`SELECT product_code, option_number, name, price, main_img_src, description, option1, option2, stock, sale_price, start, end
                FROM (product NATURAL JOIN product_option) LEFT JOIN (
                  SELECT * 
                  FROM sale_product LEFT JOIN time_sale_table
                  USING(time_id)
                  where time_id is null or start <= ? and end >= ?
                )A
                USING(product_code, option_number)
                WHERE disabled is not true and product_code=?`,[today, today, product_code])
      .then((result) => result[0]);
  };

  getAmountOfReviews = async (product_code) => {
    return this.#db
      .execute(`SELECT count(*) AS amount
                FROM reviews
                WHERE product_code=? `, [product_code])
      .then((result) => result[0][0].amount);
  };

  getReviews = async (product_code, amountOfSendData, prevPage) => {
    return this.#db
      .execute(`SELECT review_id, content, RPAD(LEFT(username, 3), 6, '*')AS username, DATE_FORMAT(createdAt, "%Y-%m-%d")AS "created" 
                FROM reviews 
                WHERE product_code=? 
                ORDER BY createdAt DESC
                LIMIT ${amountOfSendData} OFFSET ${prevPage}`, [product_code])
      .then((result) => result[0]);
  };

  testGetSale = async (today) => {
    return this.#db
      .execute(`SELECT product_code, main_img_src, name, price, sale_price, start, end 
                FROM (product NATURAL JOIN product_option) LEFT JOIN (sale_product NATURAL JOIN time_sale_table) 
                USING(product_code, option_number)
                WHERE start < '${today}' AND '${today}' < end
                GROUP BY product_code`)
      .then((result) => result[0]);
  };

  testGetALL = async (today, orderBy, prevPage, amountOfSendData) => {
    return this.#db
      .execute(`SELECT count(*) OVER() AS full_count, product_code, main_img_src, name, price, count(sale_id) AS sale, min(A.sale_price) AS sale_price, start, end 
                FROM (product NATURAL JOIN product_option) LEFT JOIN (
                  (SELECT * 
                  FROM sale_product NATURAL JOIN time_sale_table
                  WHERE start < '${today}' and end > '${today}')
                  UNION
                  (SELECT * 
                  FROM sale_product LEFT JOIN time_sale_table 
                  USING(time_id)
                  WHERE time_id IS null)
                )A
                USING(product_code, option_number)
                WHERE disabled is not true
                GROUP BY product_code
                ORDER BY ${orderBy}
                LIMIT ${amountOfSendData} OFFSET ${prevPage}`)
      .then((result) => result[0]);
  };

  testGetByName = async (name, today, orderBy, prevPage, amountOfSendData) => {
    return this.#db
      .execute(`SELECT count(*) OVER() AS full_count, product_code, main_img_src, name, price, count(sale_id) AS sale, MAX(A.sale_price) AS sale_price, start, end 
                FROM (product NATURAL JOIN product_option) LEFT JOIN (
                  (SELECT * 
                  FROM sale_product NATURAL JOIN time_sale_table
                  WHERE start < '${today}' and end > '${today}')
                  UNION
                  (SELECT * 
                  FROM sale_product LEFT JOIN time_sale_table 
                  USING(time_id)
                  WHERE time_id IS null)
                )A
                USING(product_code, option_number)
                WHERE disabled is not true and name LIKE '%${name}%'
                GROUP BY product_code
                ORDER BY ${orderBy}
                LIMIT ${amountOfSendData} OFFSET ${prevPage}`)
      .then((result) => result[0]);
  };
}
