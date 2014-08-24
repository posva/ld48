define(["lib/pixi", "lib/proton", "lib/soundjs", "src/assets", "src/const"], function(PIXI, proton, Sound, assets, CONST) {
    var Spikes = function(x, y, ind) {
        if (x && typeof x === "object") {
            ind = y;
            y = x.y;
            x = x.x;
        } else {
            x = x || 0;
            y = y || 0;
            ind = ind || 0;
        }

        this.type = "die";
        this.jumpable = true;
        this.sprite = new PIXI.Sprite(assets.spikes[ind]);
        this.position = this.sprite.position;
        this._last_position = this.position.clone();
        this.sprite.anchor.set(0, 0);
        this.sprite.position.set(x + this.sprite.anchor.x * this.sprite.width,
                                 y + this.sprite.anchor.y * this.sprite.height);
       var red = 5;
       this.rect = new PIXI.Rectangle(x - this.sprite.width * this.sprite.anchor.x + red,
                                      y - this.sprite.height * this.sprite.anchor.y + red,
                                      this.sprite.width - red, this.sprite.height - red);
    };

    return Spikes;
});
