// Import libraries
var express = require("express"),
    app = express(),
    server = require("http").createServer(app),
    io = require("socket.io").listen(server),
    mongoose = require("mongoose"),
    users = {};

// EJS preset and directory referencing
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/scripts"));

// Setup Mongo Server
mongoose.connect("mongodb://localhost/chat", function(err) {
  if (err) {
    console.log(err)``
  } else {
    console.log("Connected to MongoDB!");
  }
});

// Setup chat Schema
var chatSchema = mongoose.Schema({
  nick: String,
  msg: String,
  created: {
    type: Date,
    default: Date.now
  }
});

// Initialize chat schema
var Chat = mongoose.model("Message", chatSchema);

// Start server
server.listen(process.env.PORT || 3000, function() {
  console.log("Server is live!");
});

// Render index page
app.get("/", function(req, res) {
  res.render("index");
});

// The main interface for the chat application
io.sockets.on("connection", function(socket) {

  // Retrieves messages from database
  var query = Chat.find({});
  // Display newest messages on the bottom (Facebook Setup)
  query.sort("-created").limit(8).exec(function(err, docs) {
    if (err) throw err;
    // Send to client
    socket.emit('load msgs', docs);
  });

  // When a new user joins update the list of usernames in the chatroom
  socket.on("new user", function(data, callback) {
    // If there are no users callback false else, send data to clients
    if (data in users) {
      callback(false);
    } else {
      callback(true);
      socket.nickname = data;
      users[socket.nickname] = socket;
      updateNicknames();
    }
  });

  // Sends a whisper to a user if the @ symbol is included, otherwise, send a normal message to everyone in the room
  socket.on("send message", function(data, callback) {
    var msg = data.trim();
    // Check for @ symbol
    if (msg.substr(0, 1) === '@') {
      msg = msg.substr(1);
      var ind = msg.indexOf(" ");
      // Check for space after the username
      if (ind !== -1) {
        var name = msg.substring(0, ind);
        var msg = msg.substring(ind + 1);
        // Check if the user exists
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
      // Otherwise, send a normal message to everyone in the room
      var newMsg = new Chat({msg: msg, nick: socket.nickname});
      newMsg.save(function(err) {
        if (err) throw err;
        io.sockets.emit("new message", {msg: msg, nick: socket.nickname});
      });
    }
  });

  // Removes username from the chat room when they leave
  socket.on("disconnect", function(data) {
    if (!socket.nickname) return;
    delete users[socket.nickname];
    updateNicknames();
  });
});

// Send updated list of online users in the room to the client
function updateNicknames() {
  io.sockets.emit("usernames", Object.keys(users));
}
