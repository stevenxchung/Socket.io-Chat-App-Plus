var express = require("express"),
    app = express(),
    server = require("http").createServer(app),
    io = require("socket.io").listen(server);

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/scripts"));

nicknames = [];

server.listen(process.env.PORT || 3000, function() {
  console.log("Server is live!");
});

app.get("/", function(req, res) {
  res.render("index");
});

io.sockets.on("connection", function(socket) {
  socket.on("send message", function(data) {
    io.sockets.emit("new message", data);
  });

  socket.on("new user", function(data, callback) {
    if (nicknames.indexOf(data) != -1) {
      callback(false);
    } else {
      callback(true);
      socket.nickname = data;
      nicknames.push(socket.nickname);
      io.sockets.emit("usernames", nicknames);
    }
  });
});
