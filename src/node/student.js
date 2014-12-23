var faye    = require('faye');

module.exports = function(options) {
  var url = options.url;

  var start = function(id) {
    var client       = new faye.Client(url);
    var messageCount = 0;

    var chatSub      = null;
    var newChatSub   = null;
    var terminateSub = null;

    var connect = function() {
      client.publish('/presence/student/connect', {
        userId: id,
        role:   'student'
      });
    };

    var disconnect = function() {
      client.publish('/presence/student/disconnect', {
        userId: id,
        role:   'student'
      }).then(function() {
        chatSub.cancel();
        newChatSub.cancel();
        terminateSub.cancel();
        client.disconnect();
      });
    };

    var onNewChat = function(data) {
      console.log('Student ' + id + ' is starting new chat.');

      var sendChannel      = data.sendChannel;
      var receiveChannel   = data.receiveChannel;
      var terminateChannel = data.terminateChannel;
      var joinedChannel    = data.joinedChannel;

      chatSub = client.subscribe(receiveChannel, function(data) {
        messageCount++;

        if(messageCount == 1) {
          console.log('Student ' + id + ' got first message.');
        }

        client.publish(sendChannel, {
          message: 'Message #' + messageCount + ' from student ' + id
        });
      });

      chatSub.then(function() {
        terminateSub = client.subscribe(terminateChannel, function(data) {
          console.log('Student ' + id + ' got disconnect message.');
          disconnect();
        });

        return terminateSub;
      }).then(function() {
        client.publish(joinedChannel, { userId: id });
      });
    }

    newChatSub = client.subscribe('/presence/new_chat/student/' + id, onNewChat);
    newChatSub.then(function() {
      connect();
    });

  }

  return {
    start: start
  };
}
