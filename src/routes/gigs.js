const router = require("express").Router();

module.exports = (db) => {
  router.get("/gigs/category/:category_id", (req, res) => {
    const query = `
    SELECT * FROM gigs
    WHERE category_id = ${req.params.category_id}
    `;
    db.query(query).then((data) => {
      res.json(data.rows);
    });
  });

  router.get("/gigs/:gig_id", (req, res) => {
    db.query(`SELECT * FROM gigs WHERE id = ${req.params.gig_id}`).then(
      (data) => {
        res.send(data.rows);
      }
    );
  });

  router.get("/gigs", (req, res) =>
    db.query(`SELECT * FROM gigs;`).then(({ rows: gigs }) => {
      res.json(gigs);
    })
  );

  router.get("/top", (req, res) =>
    db.query(`SELECT * FROM gigs LIMIT 6;`).then((data) => {
      res.send(data.rows);
    })
  );

  // router.get('/gigs/:category/:id', (req, res) => {
  //   db.query(`SELECT * FROM gigs WHERE id = ${req.params.id}`)
  // });

  router.put("/gigs/", (req, res) => {
    const gig = req.body;
    const queryParams = [
      gig.userId,
      gig.category,
      gig.title,
      gig.rate,
      gig.description,
      gig.photo1,
    ];

    return db
      .query(
        `
    INSERT INTO gigs (contractor_id, category_id, title, price, description, photo_one)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
    `,
        queryParams
      )
      .then((data) => {
        const gig = data.rows[0];
        res.send(gig);
      });
  });

  router.delete("/gigs/:id", (req, res) => {
    return db
      .query(`DELETE FROM gigs WHERE id = ${req.params.id};`)
      .then((data) =>
        res.json({
          message: `gigs#${req.params.id} is removed`,
        })
      )
      .catch((err) => res.status(400).send(err));
  });

  router.get("/search/:search", (req, res) => {
    const searchParams = req.query.search;

    db.query(
      `
    SELECT * FROM gigs WHERE title LIKE '%${searchParams[0]}%' OR title LIKE '%${searchParams[1]}%' OR description LIKE '%${searchParams[0]}%' OR description LIKE '%${searchParams[1]}%';
    `
    )
      .then((data) => {
        const searchResults = data.rows;
        res.send({ searchResults });
      })
      .catch(console.log);
  });

  return router;
};
