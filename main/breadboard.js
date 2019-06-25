// Assumed variables: ctx, mouse_x, mouse_y, websocketurl, draw_all

function Breadboard(id, x_start, y_start) {
    this.image= "breadboard.png";
    this.width = 100;
    this.height = 200;
    this.pins = [
        new Pin(id, 14, 20, 80),
        new Pin(id, 12, 20, 110),
        new Pin(id, 13, 20, 140),
        new Pin(id, 15, 20, 170),
        new Pin(id, 14, 50, 80),
        new Pin(id, 12, 50, 110),
        new Pin(id, 13, 50, 140),
        new Pin(id, 15, 50, 170)
    ];

    this.on_value_change = function () {}

    this.on_click_fn = function () {}

    DraggableVirtualDevice.call(this, id, this.image, x_start, y_start, this.width, this.height, this.pins, this.on_value_change, this.on_click_fn);
}