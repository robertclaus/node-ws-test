// Assumed variables: ctx, mouse_x, mouse_y, selected_pin, pin_radius

function Pin(device_id, pin_id, x, y) {
    this.device_id = device_id;
    this.pin_id = pin_id;
    this.set_color = "white";

    this.value = 0;

    this.x = x;
    this.y = y;

    this.parent_x = x;
    this.parent_y = y;

    this.radius = pin_radius;
    this.line_width = 1;
    this.color = this.set_color;
    this.selected = false;
    this.hover = false;

    this.get_coordinates = function() {
        return [this.x + this.parent_x, this.y + this.parent_y];
    }

    this.set_value = function(val) { this.value = val;}
    this.get_value = function() {return this.value;}

    this.set_parent_offset = function(x, y) {
        this.parent_x = x;
        this.parent_y = y;
    }

    this.draw = function(parent_x, parent_y) {
        if (this.selected) {this.color = "blue";}
        else if (this.hover) {this.color = "green";}
		else {this.color = this.set_color;}

        ctx.beginPath();
		ctx.arc(this.parent_x + this.x, this.parent_y + this.y, this.radius, 0, 2 * Math.PI, true);
		ctx.stroke();
		ctx.fillStyle = this.color;
		ctx.fill();
	}

    this.on_click = function() {
        ctx.beginPath();
		ctx.arc(this.parent_x + this.x,
		        this.parent_y + this.y,
		        this.radius, 0, 2 * Math.PI, true);
		if (ctx.isPointInPath(mouse_x, mouse_y)) {
		    console.log("clicked pin");
		    if (selected_pin != null && !this.selected) {
                console.log("Connected " + this.device_id + " to " + selected_pin.device_id);
                connections.push(new Connection(selected_pin, this));
                selected_pin.selected = false;
                selected_pin = null;
                this.selected = false;
            } else {
                console.log("Selected " + this.pin_id);
                selected_pin = this;
                this.selected = true;
            }
		}
    };

    this.on_mouse_move = function() {
        ctx.beginPath();
        ctx.arc(this.parent_x + this.x, this.parent_y + this.y, this.radius, 0, 2 * Math.PI, true);
        if (ctx.isPointInPath(mouse_x, mouse_y)) {
            this.hover = true;
        } else {
            this.hover = false;
        }
    };

    this.on_mouse_down = function() {};

    this.on_mouse_up = function() {};
}