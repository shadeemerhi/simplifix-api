const { response } = require("express");

const router = require("express").Router();

module.exports = (db) => {
  router.get("/categories", (req, res) => {
    return db.query(`SELECT * FROM categories`).then((data) => {
      res.json(data.rows);
    });
  });

  router.get("/categories/:name", (req, res) => {
    db.query(
      `SELECT id FROM categories WHERE name = '${req.params.name}'`
    ).then((data) => {
      res.json(data.rows[0].id);
    });
  });

  return router;
};
