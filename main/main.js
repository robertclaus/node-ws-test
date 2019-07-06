//Assumes: websocketurl

var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");
ctx.lineWidth = 5;
var circles = [];

function init() {
virtual_devices = [
        new VirtualLED("TestA", 850, 200),
        new VirtualLED("TestB", 850, 100),
        new Battery("TestC", 630, 100),
        new Breadboard("A", 500,80),
        new VirtualDisplay("TestD", 400,300)
        //new Breadboard("B", 700,80)
];


	document.myform.url.value = websocketurl;
	document.myform.inputtext.value = "Hello World!"
	document.myform.disconnectButton.disabled = true;
	draw_all();
	doConnect();
}

var virtual_devices = [];


function doConnect() {
	websocket = new WebSocket(document.myform.url.value);

	websocket.onopen = function (evt) {
		onOpen(evt)
	};
	websocket.onclose = function (evt) {
		onClose(evt)
	};
	websocket.onmessage = function (evt) {
		onMessage(evt)
	};
	websocket.onerror = function (evt) {
		onError(evt)
	};
}

function onOpen(evt) {
	writeToScreen("connected\n");
	console.log(evt);
	document.myform.connectButton.disabled = true;
	document.myform.disconnectButton.disabled = false;
}

function onClose(evt) {
	writeToScreen("disconnected\n");
	document.myform.connectButton.disabled = false;
	document.myform.disconnectButton.disabled = true;
}

function onMessage(evt) {
	writeToScreen("response: " + evt.data + '\n');
}

function onError(evt) {
	writeToScreen('error: ' + evt.data + '\n');
	websocket.close();
	document.myform.connectButton.disabled = false;
	document.myform.disconnectButton.disabled = true;
}

function doSend(message) {
	writeToScreen("sent: " + message + '\n');
	websocket.send(message);
}

function writeToScreen(message) {
	document.myform.outputtext.value += message
	document.myform.outputtext.scrollTop = document.myform.outputtext.scrollHeight;
}
window.addEventListener("load", init, false);

function sendText() {
	doSend(document.myform.inputtext.value);
}

function clearText() {
	document.myform.outputtext.value = "";
}

function doDisconnect() {
	websocket.close();
}













function draw_all() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	var v,i = 0; while (v = virtual_devices[i++]) {v.draw();}
	var c,i = 0; while (c = connections[i++]) {c.draw();}
}

canvas.onmousemove = function (e) {
	// important: correct mouse position:
	var rect = this.getBoundingClientRect();
	mouse_x = e.clientX - rect.left;
	mouse_y = e.clientY - rect.top;

	var v,i = 0; while (v = virtual_devices[i++]) {v.on_mouse_move();}
	draw_all();
};

canvas.onclick = function (e) {
	var rect = this.getBoundingClientRect();
	mouse_x = e.clientX - rect.left;
	mouse_y = e.clientY - rect.top;

	var c,i = 0; while (c = connections[i++]) {c.on_click();}
	var v,i = 0; while (v = virtual_devices[i++]) {v.on_click();}
	draw_all();
}

canvas.onmousedown = function (e) {
	var v,i = 0; while (v = virtual_devices[i++]) {v.on_mouse_down();}
}

canvas.onmouseup = function (e) {
	var v,i = 0; while (v = virtual_devices[i++]) {v.on_mouse_up();}
}

var waiting_on_schematic = 0;

function read_schematic() {
	connections = [];

	for (var i = 0; i < devices.length; i++) {
		message = {
			"type": "listWires",
			"target": devices[i].device_id
		}
		waiting_on_schematic++;
		doSend(JSON.stringify(message));
	}
}

function clear_schematic() {
	connections = [];
	for (var i = 0; i < virtual_devices.length; i++) {
		message_obj = {
			"type": "clearWires",
			"target": virtual_devices[i].id
		};
		doSend(JSON.stringify(message_obj));
	}

	draw_all();
}