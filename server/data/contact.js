export default class ContactRepository {
  #db;

  constructor(db) {
    this.#db = db;
  }

  writeInquiry = async (
    name,
    content,
    option,
    contactInformation,
    locking,
    date
  ) => {
    return this.#db
      .execute(`INSERT INTO inquiry (name, content, contactOption, contactInformation, locking, createdAt) VALUES (?, ?, ?, ?, ?, ?)`, [
        name, 
        content, 
        option, 
        contactInformation, 
        locking,
        date
      ])
      .then((result) => result[0].insertId);
  };

  getAmountOfInquiry = async () => {
    return this.#db
      .execute(`SELECT count(*) AS amount
                FROM inquiry`)
      .then((result) => result[0][0].amount);
  };

  getInquiries = async (prevPage, amountOfSendData) => {
    return this.#db
      .execute(`SELECT *, SUBSTRING(content, 1, 10)  AS content
                FROM inquiry 
                ORDER BY createdAt DESC
                LIMIT ${amountOfSendData} OFFSET ${prevPage}`)
      .then((result) => result[0]);
  }

  getInquiry = async (id) => {
    return this.#db
      .execute(`SELECT *
                FROM inquiry 
                WHERE id=?`, [id])
      .then((result) => result[0][0]);
  };

  answer = async (id, text, date) => {
    return this.#db
      .execute(`UPDATE inquiry SET answer=?, answerDate=? WHERE id=?`, [
        text,
        date,
        id,
      ])
      .then((result) => result[0][0]);
  };
}
