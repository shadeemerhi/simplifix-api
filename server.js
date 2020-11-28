require("dotenv").config();

const Express = require("express");
const App = Express();
const BodyParser = require("body-parser");
const socketio = require("socket.io");
const http = require("http");
const cors = require("cors");
const cookieSession = require("cookie-session");
const PORT = process.env.PORT || 8080;

// PG database client / connection setup
const { Pool } = require("pg");
const dbParams = require("./knexfile.js");
const environment = process.env.ENVIRONMENT || "development";
console.log("environment", environment);
let connectionParams;
if (environment === "production") {
  connectionParams = {
    connectionString: dbParams.production.connection,
    ssl: {
      rejectUnauthorized: false,
    },
  };
} else {
  connectionParams = dbParams.development.connection;
}
console.log("connectionParams", connectionParams);
const db = new Pool(connectionParams);
db.connect();
const helpers = require("./src/helpers/dbhelper")(db);
App.use(cors({ origin: true, credentials: true }));

//Cookie-session
App.use(
  cookieSession({
    name: "session",
    keys: ["key1"],
    maxAge: 12 * 60 * 60 * 1000, // 12 hours
  })
);

// Socket IO
const server = http.createServer(App);
const io = socketio(server, { wsEngine: "ws" });
//Another socket for concurrent state updates

const socketForUpdates = require("./src/socket")(socketio(server, {
  path: '/update'
}), App);


io.on("connection", (socket) => {
  let room;
  console.log("We have a new connection!");

  socket.on("join", ({ conv_id }, callback) => {
    room = conv_id;
    socket.join(conv_id);
  });

  socket.on("typing", (data) => {
    if (data.typing === true) {
      socket.to(room).emit("display", { data, id: socket.id });
    } else {
      socket.to(room).emit("display", { data, id: socket.id });
    }
  });

  socket.on("sendMessage", (message, user, callback) => {
    console.log("text", message);
    const queryParams = [room, user.id, message];

    db.query(
      `INSERT INTO messages (conversation_id, sender_id, text)
      VALUES ($1, $2, $3)
      RETURNING *;`,
      queryParams
    ).then(() => {
      io.to(room).emit("message", { user: user.id, text: message });
      // callback();
    });
    // .catch(error => console.log(error));
  });

  socket.on("disconnect", () => {
    console.log("Disconnected");
  });
});

// Express Configuration
App.use(BodyParser.urlencoded({ extended: false }));
App.use(BodyParser.json());
App.use(Express.static("public"));
// Import Routers
const gigs = require("./src/routes/gigs");
const users = require("./src/routes/users");
const categories = require("./src/routes/categories");
const conversations = require("./src/routes/conversations");
const messages = require("./src/routes/messages");
const validation = require("./src/routes/validation")(helpers);
const orders = require("./src/routes/orders")(helpers);

// API Router
App.use("/api", gigs(db));
App.use("/api", users(db));
App.use("/api", categories(db));
App.use("/api", conversations(db));
App.use("/api", messages(db));
// App.use("/api", messages(db));
App.use("/", validation);
App.use("/api", orders);

// Port Listening
server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(
    `Express seems to be listening on port ${PORT} so that's pretty good 👍`
  );
});

// STRIPE
const stripe = require("stripe")(
  "sk_test_51Hm2BTIXKvKnuzRhfNvS0F9sSw6UBWdFMJEtwR1Mrl3wtrWBV3abraVXHKoexQ7HmwtNOfhHcCpmBdpII3td4big006Lni10cL"
);
const YOUR_DOMAIN = "http://localhost:3000/checkout";

App.post("/create-session", async (req, res) => {
  const order = req.body;
  console.log("order :", order);
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "cad",
          product_data: {
            name: order.gig.title,
            images: [order.gig.photo_one],
            description: order.gig.description,
          },
          unit_amount: order.final_price * 100,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${YOUR_DOMAIN}/success`,
    cancel_url: `${YOUR_DOMAIN}/failed`,
  });
  res.json({ id: session.id });
});
