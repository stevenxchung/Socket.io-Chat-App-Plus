$(function() {
  var socket = io.connect();
  var $messageForm = $("#send-message");
  var $messageBox = $("#message");
  var $chat = $("#chat");

  var $nickForm = $("#setNick");
  var $nickError = $("#nickError");
  var $nickBox = $("#nickname");
  var $users = $("#users");

  $nickForm.submit(function(e) {
    e.preventDefault();
    socket.emit("new user", $nickBox.val(), function(data) {
      if (data) {
        $("#nickWrap").hide();
        $("#contentWrap").show();
      } else {
        $nickError.html("That username is already taken!");
      }
    });
    $nickBox.val("");
  });

  socket.on("usernames", function(data) {
    var html = "";
    for (i = 0; i < data.length; i++) {
      html += data[i] + '</br>';
    }
    $users.html(html);
  });

  $messageForm.submit(function(e) {
    e.preventDefault();
    socket.emit("send message", $messageBox.val(), function(data, callback) {
          $chat.prepend('<span class="error">' + data + "</br>");
    });
    $messageBox.val("");
  });

  socket.on("load msgs", function(docs) {
    for (i = 0; i < docs.length; i++) {
      displayMsg(docs[i]);
    }
  });

  socket.on("new message", function(data) {
    displayMsg();
  });

  socket.on("whisper", function(data) {
    $chat.append('<span class="whisper"><strong>' + data.nick + ": </strong>"+ data.msg + "</br>");
  });

  function displayMsg(data) {
    $chat.append('<span class="msg"><strong>' + data.nick + ": </strong>"+ data.msg + "</br>");
  }
});
