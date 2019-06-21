var WebSocketServer = require("ws").Server
var http = require("http")
var express = require("express")
var app = express()
const uuidv1 = require('uuid/v1');
var port = process.env.PORT || 5000

app.use(express.static(__dirname + "/"))

var server = http.createServer(app)
server.listen(port)

console.log("http server listening on %d", port)

var wss = new WebSocketServer({server: server})
console.log("websocket server created")


var all_connections = [];
wss.on("connection", function(ws) {
      all_connections.push(ws);
      ws.id = "unknown";

      console.log("websocket connection open");

      ws.on("close", function() {
          console.log("websocket connection close")
          for( var i = 0; i < all_connections.length; i++){
               if ( all_connections[i] === ws) {
                 all_connections.splice(i, 1);
               }
           }
      });

      ws.on('message', function incoming(data) {
          console.log(data);
          message = JSON.parse(data);

          if ( ! "type" in message) {
             return;
          }

          if ( message.type == 'whoami') {
            ws.id = message.iam;
          }

          if ( message.type == 'addWire' ||
               message.type == 'removeWire' ||
               message.type == 'listWires' ||
               message.type == 'clearWires') {
            for( var i=0; i<all_connections.length; i++){
                if (! "destination" in message || ! "receiver" in message) { return;}
                if (! "device_id" in message.destination || ! "device_id" in message.receiver) { return;}

                if (message.destination.device_id == all_connections[i].id ||
                    message.receiver.device_id == all_connections[i].id) {
                    all_connections[i].send(data);
                }

            }
          }

          if ( message.type == 'data') {
            for( var i=0; i<all_connections.length; i++){
                if (! "destination" in message || ! "receiver" in message) { return;}
                if (! "device_id" in message.destination || ! "device_id" in message.receiver) { return;}

                if (message.destination.device_id == all_connections[i].id) {
                    all_connections[i].send(data);
                }
            }
          }

          if ( message.type == 'echo') {
            for( var i=0; i<all_connections.length; i++){
                all_connections[i].send(data);
            }
          }
        });
})
