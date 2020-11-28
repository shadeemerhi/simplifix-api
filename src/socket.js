module.exports = (io, app) => {
  io.on("connection", (socket) => {
    
  });
  app.use((req, res, next) => {
    req.io = io;
    next();
  });
  io.close();
};
