var express = require("express"),
    app = express(),
    server = require("http").createServer(app),
    io = require("socket.io").listen(server),
    mongoose = require("mongoose"),
    users = {};

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/scripts"));

mongoose.connect("mongodb://localhost/chat", function(err) {
  if (err) {
    console.log(err)``
  } else {
    console.log("Connected to MongoDB!");
  }
});

var chatSchema = mongoose.Schema({
  nick: String,
  msg: String,
  created: {
    type: Date,
    default: Date.now
  }
});

var Chat = mongoose.model("Message", chatSchema);

server.listen(process.env.PORT || 3000, function() {
  console.log("Server is live!");
});

app.get("/", function(req, res) {
  res.render("index");
});

io.sockets.on("connection", function(socket) {

  socket.on("new user", function(data, callback) {
    if (data in users) {
      callback(false);
    } else {
      callback(true);
      socket.nickname = data;
      users[socket.nickname] = socket;
      updateNicknames();
    }
  });

  socket.on("send message", function(data, callback) {
    var msg = data.trim();
    if (msg.substr(0, 1) === '@') {
      msg = msg.substr(1);
      var ind = msg.indexOf(" ");
      if (ind !== -1) {
        var name = msg.substring(0, ind);
        var msg = msg.substring(ind + 1);
        if (name in users) {
          users[name].emit("whisper", {msg: msg, nick: socket.nickname});
          console.log("Whisper!");
        } else {
          callback("Error! Enter a valid user.")
        }
      } else {
        callback("Error! Please enter a message for your whisper.")
      }
    } else {
      var newMsg = new Chat({msg: msg, nick: socket.nickname});
      newMsg.save(function(err) {
        if (err) throw err;
        io.sockets.emit("new message", {msg: msg, nick: socket.nickname});
      })
    }
  });

  socket.on("disconnect", function(data) {
    if (!socket.nickname) return;
    delete users[socket.nickname];
    updateNicknames();
  });
});

function updateNicknames() {
  io.sockets.emit("usernames", Object.keys(users));
}
