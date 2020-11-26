const router = require("express").Router();

module.exports = (db) => {
  router.get("/transactions", (req, res) => {
    const query = `
    SELECT * FROM transactions
    WHERE order_id = ${req.params.order_id}
    `;
    db.query(query).then((data) => {
      console.log("trans data: ", data);
    });
  });

  router.post("/transactions", (req, res) => {
    const trans = req.body;
    const queryParams = [];
    return db
      .query(
        `
      INSERT INTO transactions (order_id, price)
      VALUES ($1, $2)
      RETURNING *;
      `,
        queryParams
      )
      .then((data) => {
        console.log("trans data: ", data);
      });
  });

  return router;
};
