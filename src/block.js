define(["lib/pixi", "lib/proton", "lib/soundjs", "src/assets"], function(PIXI, proton, Sound, assets) {
    var Block = function(x, y) {
        if (x && typeof x === "object") {
            y = x.y;
            x = x.x;
        } else {
            x = x || 0;
            y = y || 0;
        }

        this.type = "block";
        this.block = true;
        this.sprite = new PIXI.Sprite(assets.block);
        this.position = this.sprite.position;
        this._last_position = this.position.clone();
        this.sprite.anchor.set(0, 0);
        this.sprite.position.set(x, y);
        this.rect = new PIXI.Rectangle(x - this.sprite.width * this.sprite.anchor.x,
                                       y - this.sprite.height * this.sprite.anchor.y,
                                       this.sprite.width, this.sprite.height);
    };

    Block.prototype.update = function(dt) {
        if (this._last_position.x !== this.position.x || this._last_position.y !== this.position.y) {
            this.rect.x = this.position.x - this.sprite.width * this.sprite.anchor.x;
            this.rect.y = this.position.y - this.sprite.height * this.sprite.anchor.y;
            this.rect.width = this.sprite.width;
            this.rect.height = this.sprite.height;
            this._last_position = this.position.clone();
        }
    };

    return Block;
});
