const router = require("express").Router();

module.exports = (helpers) => {
  router.get("/orders", (req, res) => {
    helpers
      .getOrders()
      .then((data) => res.send(data))
      .catch((err) => res.status(400).send(err));
  });
  router.put("/orders", (req, res) => {
    const order = req.body;
    helpers.createOrder(order)
    .then(data => {
      setTimeout(() => {
        res.send(data)
        req.io.emit("update", JSON.stringify({
          type: "orders",
          action: "CREATE",
          data
        }));
      }, 5000);     
    })
    .catch(err => res.status(400).send(err));
  });

  router.patch("/orders/:id", (req, res) => {
    const order = req.body;
    helpers.changeOrder(order)
    .then(data => {
      res.send(data)
      req.io.emit("update", JSON.stringify({
        type: "orders",
        action: "UPDATE",
        data
      }));
    }).catch(err => res.status(400).send(err));
  });
  return router;
};
