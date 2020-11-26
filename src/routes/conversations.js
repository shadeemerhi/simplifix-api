const router = require("express").Router();

module.exports = (db) => {

  router.get('/conversations', (req, res) => {
    db.query(`SELECT * FROM conversations`).then((data) => {
      res.json(data.rows);
    })
  })

  router.get('/conversations/:user_id', (req, res) => { 
    db.query(
      `SELECT * FROM conversations
      WHERE client_id = ${req.params.user_id}
      OR contractor_id = ${req.params.user_id}`)
    .then(data => {
      // console.log('we are at the conversations endpoint');
      res.send(data.rows);
    })
  })

  router.put('/conversations', (req, res) => {
    const { client_id, client_first, client_last, contractor_id, contractor_first, contractor_last } = req.body;
    db.query(
      `INSERT INTO conversations (client_id, client_first, client_last, contractor_id, contractor_first, contractor_last) 
       VALUES (${client_id}, '${client_first}', '${client_last}', ${contractor_id}, '${contractor_first}', '${contractor_last}')
       RETURNING *;`)
    .then(data => {
      res.send(data.rows[0])
    })

  })


  return router;
}