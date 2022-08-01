import db from "../db/database.js";

export async function getByProduct_code(product_code) {
  return db
    .execute(
      `select product_code, option_number, name, price, main_img_src, description, option1, option2, stock, sale_price, start, end
      from (product natural join product_option) 
      left join (select * 
        from sale_product left join time_sale_table
        USING(time_id))A
        using(product_code, option_number)
      WHERE disabled is not true and product_code=?`,
      [product_code]
    )
    .then((result) => result[0]);
}

export async function getAmountOfReviews(product_code) {
  return db
    .execute(
      `SELECT count(*) as amount
              FROM reviews
              where product_code=? `,
      [product_code]
    )
    .then((result) => result[0][0].amount);
}

export async function getReviews(product_code, amountOfSendData, prevPage) {
  return db
    .execute(
      `SELECT review_id, content, RPAD(LEFT(username, 3), 6, '*')AS username, DATE_FORMAT(createdAt, "%Y-%m-%d")AS "created" 
            FROM reviews 
            WHERE product_code=? 
            ORDER BY createdAt DESC
            LIMIT ${amountOfSendData} OFFSET ${prevPage}`,
      [product_code]
    )
    .then((result) => result[0]);
}

export async function testGetSale(today) {
  return db
    .execute(
      `select product_code, main_img_src, name, price, sale_price, start, end 
                    from (product natural join product_option) left join (sale_product natural join time_sale_table) 
                    using(product_code, option_number)
                    WHERE start < '${today}' and '${today}' < end
                    group by product_code`
    )
    .then((result) => result[0]);
}

export async function testGetALL(today, orderBy, prevPage, amountOfSendData) {
  return db
    .execute(
      `select count(*) OVER() AS full_count, product_code, main_img_src, name, price, count(sale_id) as sale, min(A.sale_price) as sale_price, start, end 
              from (product natural join product_option) 
                    left join (
                      (select * 
                      from sale_product natural join time_sale_table
                      where start < '${today}' and end > '${today}')
                      union
                      (select * 
                      from sale_product LEFT join time_sale_table 
                      USING(time_id)
                      WHERE time_id is null
                      ))A
                    using(product_code, option_number)
              WHERE disabled is not true
              group by product_code
              order by ${orderBy}
              LIMIT ${amountOfSendData} OFFSET ${prevPage}`
    )
    .then((result) => result[0]);
}

export async function testGetByName(
  name,
  today,
  orderBy,
  prevPage,
  amountOfSendData
) {
  return db
    .execute(
      `select count(*) OVER() AS full_count, product_code, main_img_src, name, price, count(sale_id) as sale, MAX(A.sale_price) as sale_price, start, end 
              from (product natural join product_option) 
                    left join (
                      (select * 
                      from sale_product natural join time_sale_table
                      where start < '${today}' and end > '${today}')
                      union
                      (select * 
                      from sale_product LEFT join time_sale_table 
                      USING(time_id)
                      WHERE time_id is null
                      ))A
                    using(product_code, option_number)
              WHERE disabled is not true and name LIKE '%${name}%'
              group by product_code
              order by ${orderBy}
              LIMIT ${amountOfSendData} OFFSET ${prevPage}`
    )
    .then((result) => result[0]);
}
