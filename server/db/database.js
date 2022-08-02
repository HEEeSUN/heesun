import mysql from "mysql2";

export default class Database {
  #pool;

  constructor() {
    this.#createPool();
  }

  #createPool() {
    this.#pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      database: process.env.DB_DATABASE,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT),
    });

    this.db = this.#pool.promise();
  }
}