module.exports = (db) => {
  const getUserByEmail = (email) => {
    const queryParams = [email];
    const queryStr = `SELECT * FROM users where email = $1;`;
    return db
      .query(queryStr, queryParams)
      .then((res) => res.rows[0])
      .catch((error) => console.log("Error catched: ", error));
  };

  const getUserById = (id) => {
    const queryParams = [id];
    const queryStr = `SELECT * FROM users where id = $1;`;
    return db
      .query(queryStr, queryParams)
      .then((res) => res.rows[0])
      .catch((error) => console.log("Error catched: ", error));
  };
  const getOrders = () => {
    const queryStr = `SELECT * FROM orders;`;
    return db
      .query(queryStr)
      .then((res) => res.rows)
      .catch((error) => console.log("Error catched: ", error));
  };

  const createOrder = (order) => {
    const {
      gig_id,
      client_id,
      rating,
      review,
      status,
      order_date,
      finished_date,
    } = order;
    const queryStr = `
    INSERT INTO orders (gig_id, client_id, rating, review, status, order_date, finished_date)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
    `;
    const queryParams = [
      gig_id,
      client_id,
      rating,
      review,
      status,
      order_date,
      finished_date,
    ];
    return db
      .query(queryStr, queryParams)
      .then((res) => res.rows[0])
      .catch((err) => console.log("database has an error: ", err));
  };
  return { getUserByEmail, getUserById, createOrder, getOrders };
};
