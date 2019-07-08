var WebSocketServer = require("ws").Server
var http = require("http")
var express = require("express")
var bodyParser = require('body-parser')
var app = express()
app.use(bodyParser.json());

const uuidv1 = require('uuid/v1');
var port = process.env.PORT || 5000

function check_header(req, res) {
    service = req.get('IFTTT-Channel-Key');
    header = req.get('IFTTT-Service-Key');
    key = '58b4jY9RLuqg6PFAn6D1QmIO7MP0tm8LOoI7QFHX1VOPAgGrDbqOcUVXIgEEnaBc';

    if(service != key || header !=key) {
        res.statusCode = 401;
        res.set({ 'content-type': 'application/json; charset=utf-8' });
        response = {"errors":[{"message":"IFTTT sent an OAuth2 access token that isn’t valid."}]};
        res.send(JSON.stringify(response));
        return false;
    }

    return true;
}


app.use('/static', express.static(__dirname + "/"))


app.post('/ifttt/v1/triggers/receive_data', function (req, res) {
    if(!check_header(req, res)) {return;}

    try {
        console.log(req.body);
        var data = req.body;

        if(data == undefined || data.triggerFields == undefined || data.triggerFields.ifttt_device_id == undefined) {
            res.statusCode = 400;
            var response = {"errors": [{"message":"Missing Field."}]};
            res.set({ 'content-type': 'application/json; charset=utf-8' });
            res.send(JSON.stringify(response));
        }


        var device_id = data.triggerFields.ifttt_device_id;

        var response = {
             "data": [
                {
                    "meta": {"key":"1", "id":"1", "timestamp":"1383597266"},
                    "value":"0",
                    "created_at":1383597265
                },
                {
                    "meta": {"key":"2", "id":"2", "timestamp":"1383597264"},
                    "value":"0",
                    "created_at":1383597263
                },
                {
                    "meta": {"key":"3", "id":"3", "timestamp":"1383597262"},
                    "value":"0",
                    "created_at":1383597261
                }
             ]
        };

        res.set({ 'content-type': 'application/json; charset=utf-8' });
        res.send(JSON.stringify(response));
    } catch (e) {
        console.log(e);
        var response = {"errors": ["Bad trigger.", e]};
        res.set({ 'content-type': 'application/json; charset=utf-8' });
        res.send(JSON.stringify(response));
    }

});


app.post('/ifttt/v1/actions/send_data', function (req, res) {
    if(!check_header(req, res)) {return;}

    try {
        console.log(req.body);
        var data = req.body;

        if(data == undefined || data.actionFields == undefined || data.actionFields.ifttt_device_id == undefined || data.actionFields.data_value == undefined) {
            res.statusCode = 400;
            var response = {"errors": [{"message":"Missing Field."}]};
            res.set({ 'content-type': 'application/json; charset=utf-8' });
            res.send(JSON.stringify(response));
        }

        if(data.actionFields.ifttt_device_id == "I3") {
            res.statusCode = 400;
            var response = {"errors": [{"status":"SKIP", "message":"Missing record referred to."}]};
            res.set({ 'content-type': 'application/json; charset=utf-8' });
            res.send(JSON.stringify(response));
        }


        var device_id = data.actionFields.ifttt_device_id;
        var data_value = data.actionFields.data_value;

        var response = {
             "data": [
                {
                "id":"1"
                }
             ]
        };

        res.set({ 'content-type': 'application/json; charset=utf-8' });
        res.send(JSON.stringify(response));
    } catch (e) {
        console.log(e);
        var response = {"errors": ["Bad action.", e]};
        res.set({ 'content-type': 'application/json; charset=utf-8' });
        res.send(JSON.stringify(response));
    }
});


app.get('/ifttt/v1/status', function (req, res) {
    if(!check_header(req, res)) {return;}
    res.send("Live");
});


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
    //res.charset = 'utf-8';
    //res.setHeader('Content-Type', 'application/json');
    res.set({ 'content-type': 'application/json; charset=utf-8' });
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
