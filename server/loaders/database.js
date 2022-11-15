import mysql from "mysql2";

export default class Database {
  #db;

  constructor() {
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      database: process.env.DB_DATABASE,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT),
    });

    this.#db = pool.promise();
  }

  getConnection = async () => {
    return await this.#db.getConnection();
  };

  execute = async (sql, val) => {
    const connection = await this.getConnection();

    try {
      const result = await connection.execute(sql, val);
      return result;
    } catch (error) {
      throw new Error(error);
    } finally {
      connection.release();
    }
  };

  escapeId  = (value) => {
    /*
    mysql 라이브러리가 가진 escapeId()는 value를 백틱으로 감싼 값을 리턴.
    따라서 라이브러리 사용x 그냥 똑같이 구현해 줌
    sql문 자체에서도 구현가능 하지만 일단 따로 빼줌 
    ${`${this.#db.escapeId(roomname)}`}
    (전체적으로 코드를 수정해야 하기 때문에..)

    [pool.js]
    escapeId(value) {
      return mysql.escapeId(value, false);
    }
    */
    // const val = this.#db.escapeId(value)

    const escapeValue =  "`"+value+"`";
    return escapeValue;
  }
}