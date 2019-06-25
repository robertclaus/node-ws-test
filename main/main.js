//Assumes: websocketurl

function init() {
	document.myform.url.value = websocketurl;
	document.myform.inputtext.value = "Hello World!"
	document.myform.disconnectButton.disabled = true;
}

var virtual_devices = [];

function doConnect() {
	websocket = new WebSocket(document.myform.url.value);

	virtual_devices = [
        new VirtualLED("TestA", 850, 200),
        new VirtualLED("TestB", 850, 100),
        new Battery("TestC", 630, 100),
        new Breadboard("A", 500,80),
        new Breadboard("B", 700,80)
    ];

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
	load_schematic(evt.data);
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

var pin_radius = 8;

function init_virtual_led() {
	circles.push({
		x: 300,
		y: 230,
		r: pin_radius,
		vpin: 50
	});
	circles.push({
		x: 300,
		y: 260,
		r: pin_radius,
		vpin: 51
	});
}

function pad_pin(pin) {
	var pad = "00";
	return (pad + pin).slice(-pad.length);
}
var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");
var circles = [];
//var connections = [];
var drawables = [{
		url: "led.png",
		x: 300,
		y: 40,
		w: 100,
		h: 50
	},
	{
		url: "led.png",
		x: 300,
		y: 130,
		w: 100,
		h: 50
	},
	{
		url: "swabc.gif",
		x: 300,
		y: 80,
		w: 150,
		h: 60
	},
	{
		url: "led.png",
		x: 300,
		y: 230,
		w: 100,
		h: 50,
		init: init_virtual_led
	}
];


var deviceA = {
	"device_id": "A",
	"pin_count": 4,
	"title": "Device A",
	"pin_list": [0, 1, 12, 13, 14]
};
var deviceB = {
	"device_id": "B",
	"pin_count": 4,
	"title": "Device B",
	"pin_list": [0, 1, 12, 13, 14]
};
var devices = [deviceA, deviceB];

var i = 0,
	c;

var mouse_x = 0;
var mouse_y = 0;

var total_rows = 10;
var pins_per_row = 7;
var columns = 1;
var space_between_columns = 100;

var space_between_pins = 3;
var stroke_width = 4;
var left_offset = 15;
var top_offset = 15;

//selected_pin = -1;
next_pin = -1;
dragged_drawable_start = {
	x: 0,
	y: 0,
	drawable: -1
};

for (var dev = 0; dev < devices.length; dev++) {
	for (var pin = 0; pin < devices[dev].pin_list.length; pin++) {
		for (var dup_pin = 0; dup_pin < devices[dev].pin_count; dup_pin++) {
			circles.push({
				x: dup_pin * (pin_radius * 2 + space_between_pins) + dev * (space_between_columns) + left_offset,
				y: pin * (pin_radius * 2 + space_between_pins) + top_offset,
				r: pin_radius,
				column: dev,
				row: pin,
				pin: devices[dev].pin_list[pin],
				vpin: devices[dev].pin_list[pin],
				device: devices[dev].device_id
			});
		}
	}
}

var i = 0;
c;
while (c = drawables[i++]) {
	if (typeof c.init === "function") {
		c.init();
	}
}

function draw_all() {
	ctx.clearRect(0, 0, canvas.width, canvas.height); // for demo

	var i = 0,
		c;
	while (c = circles[i++]) {
		ctx.beginPath();
		ctx.arc(c.x, c.y, c.r, 0, 2 * Math.PI, true);
		ctx.stroke();
		ctx.fillStyle = "white";
		if (c.row == 0) {
			ctx.fillStyle = "red";
		}
		if (c.row == 1) {
			ctx.fillStyle = "gray";
		}
		if (ctx.isPointInPath(mouse_x, mouse_y)) {
			ctx.fillStyle = "green";
		}
		if (selected_pin == i - 1) {
			ctx.fillStyle = "blue";
		}
		ctx.fill();
	}

	/*i = 0;
	c;
	while (c = connections[i++]) {
		ctx.beginPath();
		r = circles[c.receiver];
		d = circles[c.destination];
		ctx.moveTo(r.x, r.y);
		ctx.lineTo(d.x, d.y);
		ctx.stroke();
	}*/

	i = 0;
	c;
	while (c = drawables[i++]) {
		var img = new Image;
		img.src = c.url;
		is_dragged = dragged_drawable_start.drawable == i - 1;
		img.onload = function () {
			var x = c.x;
			var y = c.y;
			if (is_dragged) {
				x = c.x + (mouse_x - dragged_drawable_start.x);
				y = c.y + (mouse_y - dragged_drawable_start.y);
			}
			ctx.drawImage(img, x, y, c.w, c.h); // Or at whatever offset you like
		}(c, img, is_dragged);
	}

	var v,i = 0; while (v = virtual_devices[i++]) {v.draw();}
	var c,i = 0; while (c = connections[i++]) {c.draw();}
}

function find_clicked_pin(x, y) {
	var i = 0,
		c;
	while (c = circles[i++]) {
		ctx.beginPath();
		ctx.arc(c.x, c.y, c.r, 0, 2 * Math.PI, true);
		if (ctx.isPointInPath(mouse_x, mouse_y)) {
			return i - 1;
		}
	}
	return -1;
}

function find_clicked_connection(x, y) {
	/*var i = 0,
		c;
	while (c = connections[i++]) {
		ctx.beginPath();
		r = circles[c.receiver];
		d = circles[c.destination];
		ctx.moveTo(r.x, r.y);
		ctx.lineTo(d.x, d.y);
		if (ctx.isPointInStroke(mouse_x, mouse_y)) {
			return i - 1;
		}
	}
	return -1;*/
}

function find_clicked_drawable(x, y) {
	var i = 0,
		c;
	while (c = drawables[i++]) {
		ctx.beginPath();
		ctx.rect(c.x, c.y, c.w, c.h);
		if (ctx.isPointInPath(mouse_x, mouse_y)) {
			return i - 1;
		}
	}
	return -1;
}

function make_connection(r, d) {
	console.log("connection " + selected_pin + " " + next_pin);
	connections.push({
		receiver: selected_pin,
		destination: next_pin
	});
	selected_pin = -1;
	next_pin = -1;
	rec = circles[r];
	des = circles[d];
	draw_all();
	message = {
		"type": "addWire",
		"receiver": {
			"device_id": rec.device,
			"pin_id": rec.pin
		},
		"destination": {
			"device_id": des.device,
			"pin_id": des.pin
		}
	}

	var message = JSON.stringify(message);
	console.log("Consider sending: " + message);
	doSend(message);
}

function remove_connection(c) {
	/*old_connection = connections.splice(c, 1)[0];
	r = old_connection.receiver;
	d = old_connection.destination;
	message = {
		"type": "removeWire",
		"receiver": {
			"device_id": circles[r].device,
			"pin_id": circles[r].pin
		},
		"destination": {
			"device_id": circles[d].device,
			"pin_id": circles[d].pin
		}
	}
	var message = JSON.stringify(message);
	console.log("Consider sending: " + message);
	doSend(message);*/
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
	/*var potential_connection = find_clicked_connection(mouse_x, mouse_y);
	if (potential_connection != -1) {
		remove_connection(potential_connection);
		draw_all();
		return;
	}
	var potential_pin = find_clicked_pin(mouse_x, mouse_y);
	if (potential_pin != -1) {
		if (selected_pin == -1) {
			selected_pin = potential_pin;
			draw_all();
		} else {
			next_pin = potential_pin;
			make_connection(selected_pin, next_pin);
			draw_all();
		}
	}*/
	var c,i = 0; while (c = connections[i++]) {c.on_click();}
	var v,i = 0; while (v = virtual_devices[i++]) {v.on_click();}
	draw_all();
}

canvas.onmousedown = function (e) {
	var potential_drawable = find_clicked_drawable(mouse_x, mouse_y);
	if (potential_drawable != -1) {
		console.log("drawable " + potential_drawable);
		dragged_drawable_start = {
			x: mouse_x,
			y: mouse_y,
			drawable: potential_drawable
		};
	}
	var v,i = 0; while (v = virtual_devices[i++]) {v.on_mouse_down();}
}

canvas.onmouseup = function (e) {
	d = dragged_drawable_start.drawable;
	if (d != -1) {
		drawables[d].x = drawables[d].x + (mouse_x - dragged_drawable_start.x);
		drawables[d].y = drawables[d].y + (mouse_y - dragged_drawable_start.y);
		dragged_drawable_start.drawable = -1;
	}
	var v,i = 0; while (v = virtual_devices[i++]) {v.on_mouse_up();}
}

ctx.lineWidth = 5;
draw_all();

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

function any_connection_references_pin(pin) {
	console.log("Checking pin: " + pin);
	for (var i = 0; i < connections.length; i++) {
		console.log(connections[i].receiver + " -- " + pin);
		if (connections[i].receiver == pin || connections[i].destination == pin) {
			return true;
		}
	}
	return false;
}

function load_schematic(data) {
	if (waiting_on_schematic) {
		waiting_on_schematic--;
		console.log(data);
		new_connections = JSON.parse(data);
		if (new_connections.type == "wireList") {
			console.log(new_connections);
			console.log(circles);
			wires = new_connections.wires;
			if (wires === null) {
				return;
			}
			for (var i = 0; i < wires.length; i++) {
				r_dev = wires[i].receiver.device_id;
				r_pin = wires[i].receiver.pin_id;
				d_dev = wires[i].destination.device_id;
				d_pin = wires[i].destination.pin_id;
				receiver_c = null;
				destination_c = null;

				for (var c = 0; c < circles.length; c++) {
					if (circles[c].device == r_dev && circles[c].pin == r_pin) {
						if (!any_connection_references_pin(c)) {
							receiver_c = c;
						}
					}
					if (circles[c].device == d_dev && circles[c].pin == d_pin) {
						if (!any_connection_references_pin(c)) {
							destination_c = c;
						}
					}
				}

				if (receiver_c != null && destination_c != null) {
					connections.push({
						receiver: receiver_c,
						destination: destination_c
					});
				}
			}
		}
		draw_all();
	}
}

function clear_schematic() {
	connections = [];
	for (var i = 0; i < devices.length; i++) {
		message_obj = {
			"type": "clearWires",
			"target": devices[i].device_id
		};
		doSend(JSON.stringify(message_obj));
	}

	draw_all();
}

var receiver_element = -1;

var classname = document.getElementsByClassName("pins");

var myFunction = function () {
	var attribute = this.getAttribute("data-pin");
	console.log(attribute);
	if (receiver_element == -1) {
		receiver_element = this;
		receiver_element.style.backgroundImage = "url(Selected.png)";
	} else {
		doSend("a" + receiver_element.getAttribute("data-pin") + this.getAttribute("data-pin"));
		receiver_element.style.backgroundImage = null;
		receiver_element = -1;

	}
};

for (var i = 0; i < classname.length; i++) {
	classname[i].addEventListener('click', myFunction, false);
}