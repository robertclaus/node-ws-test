var websocketurl = "ws://roberts-websocket.herokuapp.com";

var selected_pin = null;
var connections = [];

var pin_radius = 10;

var mouse_x = 0;
var mouse_y = 0;

var connectionType = "digital";
function setConnectionType(type){
    connectionType = type;
    document.getElementById("wireType").value = type;
}