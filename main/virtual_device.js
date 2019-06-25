// Assumed variables: ctx, mouse_x, mouse_y, websocketurl, draw_all

function VirtualDevice(id, draw_fn, on_click_fn, on_mouse_move_fn, on_mouse_down_fn, on_mouse_up_fn, pins, on_value_change_fn) {
    this.id = id;
    this.websocket = new WebSocket(websocketurl);
    this.pins = pins;
    this.draw_fn = draw_fn;
    this.on_click_fn = on_click_fn;
    this.on_mouse_move_fn = on_mouse_move_fn;
    this.on_mouse_down_fn = on_mouse_down_fn;
    this.on_mouse_up_fn = on_mouse_up_fn;
    this.on_value_change_fn = on_value_change_fn;


    this.draw = function() {
        this.draw_fn();
        for(var i = 0; i< this.pins.length; i++) {
            this.pins[i].draw();
        }
    };

    this.on_click = function () {
        console.log("device on click");
        this.on_click_fn();
        for(var i = 0; i< this.pins.length; i++) {
            this.pins[i].on_click();
        }
    };

    this.on_mouse_move = function () {
        this.on_mouse_move_fn();
        for(var i = 0; i< this.pins.length; i++) {
            this.pins[i].on_mouse_move();
        }
    };

    this.on_mouse_down = function() {
        this.on_mouse_down_fn();
        for(var i = 0; i< this.pins.length; i++) {
            this.pins[i].on_mouse_down();
        }
    };

    this.on_mouse_up = function() {
        this.on_mouse_up_fn();
        for(var i = 0; i< this.pins.length; i++) {
            this.pins[i].on_mouse_up();
        }
    };

    this.log = function(message) {
	    console.log("["+this.id+"] " + message);
	};

	this.sendMessage = function(message) {
	    this.log(message);
	    try {
            this.websocket.send(message);
        }
        catch(e){
            this.log("Exception: "+e);
        }
	};

	this.websocket.onopen = function (evt) {
        this.sendMessage("Connected virtual device\n");
        message = {
                "type": "whoami",
                "iam": this.id
        };
        this.sendMessage(JSON.stringify(message));
	}.bind(this);

	this.websocket.onclose = function (evt) {
	    this.sendMessage("Closed");
		console.log(evt);
	}.bind(this);

	this.websocket.onmessage = function (evt) {
	    this.sendMessage("Message");
	    message = JSON.parse(evt.data);
	    if (message.type == "data") {
	        var relevant_pin = null;
	        if (message.receiver.device_id == this.id) {
	            relevant_pin = message.receiver;
	        }
	        if (message.destination.device_id == this.id) {
                relevant_pin = message.destination;
	        }

	        if (relevant_pin != null) {
	        	 for (var i = 0; i<this.pins.length; i++) {
	                if (relevant_pin.pin_id == this.pins[i].pin_id) {
	                    this.pins[i].set_value(message.payload);
	                    this.on_value_change_fn();
	                }
	            }
	        }
	        draw_all();
	    }
		console.log(evt);
	}.bind(this);

	this.websocket.onerror = function (evt) {
	    this.sendMessage("Error");
	    console.log(evt);
	}.bind(this);
}

function DraggableVirtualDevice(id, image, x_start, y_start, width, height, pins, on_value_change, on_click_fn) {
    this.image = image;
    this.w = width;
    this.h = height;
    this.x = x_start;
    this.y = y_start;
    this.current_x = x_start;
    this.current_y = y_start;
    this.drag_start_x = 0;
    this.drag_start_y = 0;
    this.is_dragged = false;

    for(var i = 0; i< this.pins.length; i++) {
        this.pins[i].set_parent_offset(this.current_x, this.current_y);
    }

    this.set_image = function (img) {
        this.image = img;
    }

    this.on_click_fn = on_click_fn;

    this.draw_fn = function() {
		this.img = new Image;
		this.img.src = this.image;
		device = this;
		this.img.onload = function () {
			ctx.drawImage(device.img, device.current_x, device.current_y, device.w, device.h);
		}(device);
    };

    this.on_mouse_move_fn = function() {
        if (this.is_dragged) {
            this.current_x = this.x + (mouse_x - this.drag_start_x);
            this.current_y = this.y + (mouse_y - this.drag_start_y);

            for(var i = 0; i< this.pins.length; i++) {
                this.pins[i].set_parent_offset(this.current_x, this.current_y);
            }
        }
    };

    this.on_mouse_down_fn = function() {
        ctx.beginPath();
		ctx.rect(this.x, this.y, this.w, this.h);
		var is_selected = ctx.isPointInPath(mouse_x, mouse_y);
		if (is_selected) {
            this.drag_start_x = mouse_x;
            this.drag_start_y = mouse_y;
            this.is_dragged = true;
            console.log("Selected");
        }
	};

    this.on_mouse_up_fn = function() {
        if (this.is_dragged) {
            this.x = this.x + (mouse_x - this.drag_start_x);
            this.y = this.y + (mouse_y - this.drag_start_y);
            this.current_x = this.x;
            this.current_y = this.y;
            this.is_dragged = false;
            console.log("Dropped");
        }
    };

    VirtualDevice.call(this, id, this.draw_fn, this.on_click_fn, this.on_mouse_move_fn, this.on_mouse_down_fn, this.on_mouse_up_fn, pins, this.on_value_change);
}

function VirtualLED(id, x_start, y_start) {
    this.image_on = "led.png";
    this.image_off = "led_off.png";
    this.width = 100;
    this.height = 50;
    this.pins = [
        new Pin(id, 2, 0, 10),
        new Pin(id, 3, 0, 40)
    ];

    this.on_value_change = function () {
        if( this.pins[0].get_value() != this.pins[1].get_value()) {
            this.set_image(this.image_on);
        } else {
            this.set_image(this.image_off);
        }
    }

    this.on_click_fn = function () {}

    DraggableVirtualDevice.call(this, id, this.image_on, x_start, y_start, this.width, this.height, this.pins, this.on_value_change, this.on_click_fn);
}

function Battery(id, x_start, y_start) {
    this.id = id;
    this.width = 50;
    this.height = 50;
    this.img = "battery.png";
    this.pins = [
        new Pin(id, 2, 10, 0),
        new Pin(id, 3, 40, 0)
    ];

    this.current_status = 0;

    this.on_value_change = function() {}

    this.on_click_fn = function() {
        ctx.beginPath();
		ctx.rect(this.x, this.y, this.w, this.h);
		var is_selected = ctx.isPointInPath(mouse_x, mouse_y);

		if (!is_selected) {
		    return;
		}

        if(this.current_status == 0) {
            this.current_status = 1;
        } else {
            this.current_status = 0;
        }

        this.send_data = function(rec_dev, rec_pin, des_dev, des_pin, val) {
            message = {
                    "type": "data",
                    "receiver": {
                        "device_id" : rec_dev,
                        "pin_id" : rec_pin
                    },
                    "destination": {
                        "device_id" : des_dev,
                        "pin_id" : des_pin
                    },
                    "payload": val
            };
            this.sendMessage(JSON.stringify(message));
        }

        for (var i = 0; i< connections.length; i++) {
            if (connections[i].pin_a == this.pins[0]) {
                this.send_data(
                    connections[i].pin_a.device_id,
                    connections[i].pin_a.pin_id,
                    connections[i].pin_b.device_id,
                    connections[i].pin_b.pin_id,
                    this.current_status
                 );
            }

            if (connections[i].pin_a == this.pins[1]) {
                this.send_data(
                    connections[i].pin_a.device_id,
                    connections[i].pin_a.pin_id,
                    connections[i].pin_b.device_id,
                    connections[i].pin_b.pin_id,
                    0
                 );
            }
        }
    }

    DraggableVirtualDevice.call(this, id, this.img, x_start, y_start, this.width, this.height, this.pins, this.on_value_change, this.on_click_fn);
}