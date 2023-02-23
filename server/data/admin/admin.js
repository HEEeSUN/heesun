export default class AdminRepository {
  #db

  constructor(db) {
    this.#db = db;
  }

  findById = async (admin) => {
    return this.#db
      .execute(`SELECT * FROM admin WHERE id=?`, [admin])
      .then((result) => result[0][0]);
  };
  
  findByUsername = async (admin) => {
    return this.#db
      .execute(`SELECT * FROM admin WHERE username=?`, [admin])
      .then((result) => result[0][0]);
  };

  getMenuList = async (admin) => {
    return this.#db
      .execute(`SELECT * 
                FROM access_authority NATURAL JOIN admin_menu_list 
                WHERE id=?`, [admin])
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

  get6month = async (startDate, endDate) => {
    return this.#db
      .execute(`SELECT MID(merchantUID, 1, 6) month, sum(products_price) AS sales, IFNULL(SUM(refundaaaaamount),0) AS refund, IFNULL((SUM(products_price)-SUM(refundaaaaamount)),0) AS revenue
                FROM ((
                  SELECT *
                  FROM payment)A 
                    LEFT join (
                  SELECT merchantUID, sum(productsPrice) AS refundaaaaamount
                  FROM new_refund
                  GROUP BY merchantUID
                  )B
                  USING (merchantUID)
                )
                WHERE MID(merchantUID, 1, 6) BETWEEN ${startDate} AND ${endDate}
                GROUP BY month`)
      .then((result) => result[0]);
  };

  createAdmin = async (admin, password, menuList) => {
    let conn;

    try {
      conn = await this.#db.getConnection();
      await conn.beginTransaction();

      const admin_id = await conn.execute(`
        INSERT INTO admin (username, password) VALUES (?, ?)`, [
          admin,
          password,
        ]).then(result=>result[0].insertId)

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
}
