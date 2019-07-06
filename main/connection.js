// Assumed variables: ctx, mouse_x, mouse_y, selected_pin, pin_radius

function Connection(pin_a, pin_b, type) {
    this.pin_a = pin_a;
    this.pin_b = pin_b;
    this.type = type

	message = {
		"type": "addWire",
		"receiver": {
			"device_id": pin_a.device_id,
			"pin_id": pin_a.pin_id
		},
		"destination": {
			"device_id": pin_b.device_id,
			"pin_id": pin_b.pin_id
		},
		"dataType": this.type
	};

	var message = JSON.stringify(message);
	console.log("Consider sending: " + message);
	doSend(message);



    this.draw = function () {
        var old_style = ctx.strokeStyle;

        var x1 = this.pin_a.get_coordinates()[0];
        var y1 = this.pin_a.get_coordinates()[1];
        var x2 = this.pin_b.get_coordinates()[0];
        var y2 = this.pin_b.get_coordinates()[1];

        var gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop("0", "red");
        gradient.addColorStop("0.25", this.connection_color());
        gradient.addColorStop("0.75", this.connection_color());
        gradient.addColorStop("1.0", "blue");

        // Fill with gradient
        ctx.strokeStyle = gradient;

        ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.stroke();
		ctx.strokeStyle = old_style;
    };

    this.on_click = function () {

        ctx.beginPath();
		ctx.moveTo(this.pin_a.get_coordinates()[0], this.pin_a.get_coordinates()[1]);
		ctx.lineTo(this.pin_b.get_coordinates()[0], this.pin_b.get_coordinates()[1]);
		if (ctx.isPointInStroke(mouse_x, mouse_y)) {
            var i = connections.indexOf(this);
            connections.splice(i, 1);

            message = {
            "type": "removeWire",
            "receiver": {
                "device_id": this.pin_a.device_id,
                "pin_id": this.pin_a.pin_id
            },
            "destination": {
                "device_id": this.pin_b.device_id,
                "pin_id": this.pin_b.pin_id
            },
            "dataType": this.type
            };

            var message = JSON.stringify(message);
            console.log("Consider sending: " + message);
            doSend(message);
		}
    };

    this.connection_color = function() {
        if(this.type == "digital"){
            return "black";
        }
        if(this.type == "analog"){
            return "green";
        }
        return "gray";
    }
}