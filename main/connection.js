// Assumed variables: ctx, mouse_x, mouse_y, selected_pin, pin_radius

function Connection(pin_a, pin_b) {
    this.pin_a = pin_a;
    this.pin_b = pin_b;

	message = {
		"type": "addWire",
		"receiver": {
			"device_id": pin_a.device_id,
			"pin_id": pin_a.pin_id
		},
		"destination": {
			"device_id": pin_b.device_id,
			"pin_id": pin_b.pin_id
		}
	};

	var message = JSON.stringify(message);
	console.log("Consider sending: " + message);
	doSend(message);


    this.draw = function () {
        ctx.beginPath();
		ctx.moveTo(this.pin_a.get_coordinates()[0], this.pin_a.get_coordinates()[1]);
		ctx.lineTo(this.pin_b.get_coordinates()[0], this.pin_b.get_coordinates()[1]);
		ctx.stroke();
    };

    this.on_click = function () {
        ctx.beginPath();
		ctx.moveTo(this.pin_a.get_coordinates()[0], this.pin_a.get_coordinates()[1]);
		ctx.lineTo(this.pin_b.get_coordinates()[0], this.pin_b.get_coordinates()[1]);
		if (ctx.isPointInStroke(mouse_x, mouse_y)) {
            var i = connections.indexOf(this);
            connections.splice(i, 1);
		}
    };
}