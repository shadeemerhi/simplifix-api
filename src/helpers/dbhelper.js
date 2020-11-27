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

  const changeOrder = (params) => {
    const {id, status, rating, review, order_date, finished_date, final_price} = params;
    const queryParams = [];
    let queryStr = `UPDATE orders SET `;
    if(status) {
      queryParams.length && (queryStr += ', ');
      queryParams.push(status);
      queryStr += `status = $${queryParams.length}`
    }
    if(rating) {
      queryParams.length && (queryStr += ', ');
      queryParams.push(rating);
      queryStr += `rating = $${queryParams.length}`
    }
    if(review) {
      queryParams.length && (queryStr += ', ');
      queryParams.push(review);
      queryStr += `review = $${queryParams.length}`
    }
    if(order_date) {
      queryParams.length && (queryStr += ', ');
      queryParams.push(order_date);
      queryStr += `order_date = $${queryParams.length}`
    }
    if(finished_date) {
      queryParams.length && (queryStr += ', ');
      queryParams.push(finished_date);
      queryStr += `finished_date = $${queryParams.length}`
    }
    if(final_price) {
      queryParams.length && (queryStr += ', ');
      queryParams.push(final_price);
      queryStr += `final_price = $${queryParams.length}`
    }
    queryParams.push(id);
    queryStr += ` WHERE id = $${queryParams.length} RETURNING *;`;
    
    return db.query(queryStr, queryParams)
    .then(res => res.rows[0])
    .catch((error) => console.log("Error catched: ", error));
  }
  return { getUserByEmail, getUserById, createOrder, getOrders, changeOrder };
};
