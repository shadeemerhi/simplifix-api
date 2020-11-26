const router = require("express").Router();

module.exports = (helpers) => {
  router.get("/login", (req, res) => {
    const email = req.session.userEmail || "";
    helpers
      .getUserByEmail(email)
      .then((data) => {
        res.send({ user: data ? data : null });
      })
      .catch((err) => res.status(400));
  });

  router.post("/login", (req, res) => {
    const { email, password } = req.body;
    helpers.getUserByEmail(email).then((data) => {
      if (!data) {
        res.status(400).send({ msg: "Email does not exist!" });
      } else if (data.password !== password) {
        res.status(400).send({ msg: "Password is incorrect!" });
      } else {
        req.session.userEmail = data.email;
        res.send({ user: data });
      }
    });
  });
  router.post("/logout", (req, res) => {
    req.session = null;
    res.send({ user: null });
  });

  return router;
};
