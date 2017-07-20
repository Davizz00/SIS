var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Gpio = require('onoff').Gpio;

var port = process.env.PORT || 8888;

http.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));


var led = new Gpio(14, 'out');
var button = new Gpio(18, 'in', 'both');



io.on('connection', function(socket){

  
      button.watch(function(err, value) {
          led.writeSync(value);
          // send (sensor) value to everyone
          io.emit('sensor', value);
          
          

      });
      
  })

  