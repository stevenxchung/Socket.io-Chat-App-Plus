$(function() {
  var socket = io.connect();
  var $messageForm = $("#send-message");
  var $messageBox = $("#message");
  var $chat = $("#chat");

  var $nickForm = $("#setNick");
  var $nickError = $("#nickError");
  var $nickBox = $("#nickname");
  var $users = $("#users");

  $messageForm.submit(function(e) {
    e.preventDefault();
    socket.emit("send message", $messageBox.val());
    $messageBox.val("");
  });

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

  socket.on("new message", function(data) {
    $chat.prepend(data + "</br>");
  });
});
