import mysql from "mysql2";
import config from "../config.js";

const pool = mysql.createPool({
  host: config.host.host,
  user: config.host.user,
  database: config.host.database,
  password: config.host.password,
});

 const db = pool.promise();
 export default db;