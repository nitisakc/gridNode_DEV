var tcs = require('socket.io-client')
        .connect('http://localhost:5000/');

tcs.on('connect', () => {
  tcs.on('conn', function (msg) {
    
    console.log("My id: " + msg);
  });
  tcs.on('send', function (msg) {
    
    console.log("send: " + msg);
  });
});

tcs.on('disconnect', function () {
  console.log('disconnect');
});