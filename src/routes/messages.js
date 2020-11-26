const router = require("express").Router();


module.exports = (db) => {

  router.get('/messages/:conversation_id', (req, res) => {
    console.log('at api room', req.params.conversation_id)
    const query = `
    SELECT * FROM messages
    WHERE conversation_id = ${req.params.conversation_id}
    `;
    db.query(query).then(data => {
      // console.log('messages', data.rows);
      res.json(data.rows);
    })
  })

  router.put('/messages', (req, res) => {
  });


  return router;
}