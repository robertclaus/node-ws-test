// Assumed variables: ctx, mouse_x, mouse_y, websocketurl, draw_all

function Breadboard(id, x_start, y_start) {
    this.image= "breadboard.png";
    this.width = 100;
    this.height = 360;
    this.pins = [
        new Pin(id, 0, 20, 20, false),
        new Pin(id, 0, 20, 40, false),
        new Pin(id, 0, 20, 60, false),
        new Pin(id, 0, 20, 80, false),
        new Pin(id, 0, 20, 100, false),
        new Pin(id, 0, 20, 120, false),
        new Pin(id, 0, 20, 140, false),
        new Pin(id, 0, 20, 160, false),
        new Pin(id, 14, 20, 180),
        new Pin(id, 12, 20, 200),
        new Pin(id, 13, 20, 220),
        new Pin(id, 15, 20, 240),
        new Pin(id, 0, 20, 260, false),
        new Pin(id, 0, 20, 280, false),
        new Pin(id, 0, 20, 300, false),
        new Pin(id, 0, 20, 320, false),
        new Pin(id, 0, 20, 340, false),

        new Pin(id, 0, 80, 20, false),
        new Pin(id, 0, 80, 40, false),
        new Pin(id, 0, 80, 60, false),
        new Pin(id, 0, 80, 80, false),
        new Pin(id, 0, 80, 100, false),
        new Pin(id, 0, 80, 120, false),
        new Pin(id, 0, 80, 140, false),
        new Pin(id, 0, 80, 160, false),
        new Pin(id, 0, 80, 180, false),
        new Pin(id, 0, 80, 200, false),
        new Pin(id, 0, 80, 220, false),
        new Pin(id, 0, 80, 240, false),
        new Pin(id, 0, 80, 260, false),
        new Pin(id, 0, 80, 280, false),
        new Pin(id, 0, 80, 300, false),
        new Pin(id, 0, 80, 320, false),
        new Pin(id, 0, 80, 340, false),
    ];

    this.on_value_change = function () {}

    this.on_click_fn = function () {}

    DraggableVirtualDevice.call(this, id, this.image, x_start, y_start, this.width, this.height, this.pins, this.on_value_change, this.on_click_fn);
}