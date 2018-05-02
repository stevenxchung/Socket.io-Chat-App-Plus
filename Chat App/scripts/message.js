// Initialize variables and selectors
var socket = io.connect();
var $messageForm = $("#send-message");
var $messageBox = $("#message");
var $chat = $("#chat");

var $nickForm = $("#setNick");
var $nickError = $("#nickError");
var $nickBox = $("#nickname");
var $users = $("#users");

$(function() {

  // Where the user submits their username
  $nickForm.submit(function(e) {
    e.preventDefault();
    socket.emit("new user", $nickBox.val(), function(data) {
      // When the user submits a name, show the chatroom and hide the username form
      if (data) {
        $("#nickWrap").hide();
        $("#contentWrap").show();
      // Otherwise, user already exists
      } else {
        $nickError.html("That username is already taken!");
      }
    });
    // Generate a blank form by default
    $nickBox.val("");
  });

  // Display list of online users to the client
  socket.on("usernames", function(data) {
    var html = "";
    for (i = 0; i < data.length; i++) {
      html += data[i] + '</br>';
    }
    $users.html(html);
  });

  // Where the user submits their message
  $messageForm.submit(function(e) {
    e.preventDefault();
    // Generate error if the callback is false for send message
    socket.emit("send message", $messageBox.val(), function(data, callback) {
          $chat.prepend('<span class="error">' + data + "</br>");
    });
    // Generate a blank message by default
    $messageBox.val("");
  });

  // Load messages to the client with the latest messages at the bottom
  socket.on("load msgs", function(docs) {
    for (i = docs.length - 1; i >= 0; i--) {
      displayMsg(docs[i]);
    }
  });

  // Display new message to the client
  socket.on("new message", function(data) {
    displayMsg(data);
  });

  // Display whisper to the client
  socket.on("whisper", function(data) {
    $chat.append('<span class="whisper"><strong>' + data.nick + ": </strong>"+ data.msg + "</br>");
  });
});

// Display message function
function displayMsg(data) {
  $chat.append('<span class="msg"><strong>' + data.nick + ": </strong>"+ data.msg + "</br>");
}
