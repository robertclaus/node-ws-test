var WebSocketServer = require("ws").Server
var http = require("http")
var express = require("express")
var app = express()
const uuidv1 = require('uuid/v1');
var port = process.env.PORT || 5000

function check_header(req, res) {
    service = req.get('IFTTT-Channel-Key');
    header = req.get('IFTTT-Service-Key');
    key = '58b4jY9RLuqg6PFAn6D1QmIO7MP0tm8LOoI7QFHX1VOPAgGrDbqOcUVXIgEEnaBc';

    if(service != key || header !=key) {
        res.statusCode = 401;
        res.send("Bad headers");
        return false;
    }

    return true;
}

app.use('/static', express.static(__dirname + "/"))

app.get('/ifttt/v1/triggers/data', function (req, res) {
    if(!check_header(req, res)) {return;}
    res.send('Test');
});

app.get('/ifttt/v1/status', function (req, res) {
    if(!check_header(req, res)) {return;}
    res.send("Live");
});

//http://roberts-websocket.herokuapp.com/ifttt/v1/test/setup
app.post('/ifttt/v1/test/setup', function (req, res) {
    if(!check_header(req, res)) {return;}
    var test_setup = {
          "data": {
            "samples": {
              "triggers": {
                "receive_data": {
                  "ifttt_device_id": "I1"
                }
              },
              "actions": {
                "send_data": {
                  "ifttt_device_id": "I2",
                  "data_value": "0"
                }
              },
              "actionRecordSkipping": {
                "send_data": {
                  "ifttt_device_id": "I3",
                  "data_value": "0"
                }
              }
            }
          }
        };
    res.charset = 'utf-8';
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(test_setup));
});

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

          try {
            message = JSON.parse(data);
          } catch (e) {
            console.log("Exception: "+e);
            return;
          }

          if ( ! "type" in message) {
             return;
          }

          if ( message.type == 'whoami') {
            ws.id = message.iam;
          }

          if ( message.type == 'addWire' ||
               message.type == 'removeWire') {
            for( var i=0; i<all_connections.length; i++){
                if (! "destination" in message || ! "receiver" in message) { return;}
                if (! "device_id" in message.destination || ! "device_id" in message.receiver) { return;}

                if (message.destination.device_id == all_connections[i].id ||
                    message.receiver.device_id == all_connections[i].id) {
                    all_connections[i].send(data);
                }

            }
          }

          if ( message.type == 'listWires' ||
               message.type == 'clearWires') {
            for( var i=0; i<all_connections.length; i++){
                if (! "target" in message) { return;}

                if (message.target == all_connections[i].id) {
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

          if ( message.type == 'echo' || message.type == "wireList") {
            for( var i=0; i<all_connections.length; i++){
                all_connections[i].send(data);
            }
          }
        });
})
