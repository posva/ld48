define(["lib/pixi", "lib/proton", "lib/soundjs", "src/assets"], function(PIXI, proton, Sound, assets) {
    var FallBlock = function(x, y) {
        if (x && typeof x === "object") {
            y = x.y;
            x = x.x;
        } else {
            x = x || 0;
            y = y || 0;
        }

        this.type = "block";
        this.currentTimer = -1;
        this.timer = 3500;
        this.block = true;
        this.inactive = false;
        this.sprite = new PIXI.Sprite(assets.block);
        this.position = this.sprite.position;
        this._last_position = this.position.clone();
        this.sprite.anchor.set(0, 0);
        this.sprite.position.set(x, y);
        this.rect = new PIXI.Rectangle(x - this.sprite.width * this.sprite.anchor.x,
                                       y - this.sprite.height * this.sprite.anchor.y,
                                       this.sprite.width, this.sprite.height);
    };

    FallBlock.prototype.activate = function() {
        if (this.currentTimer <= 0)
            this.currentTimer = 2000;
        //start soem aniamtion
    };

    FallBlock.prototype.update = function(dt) {
        if (this.currentTimer > 0) {
            this.currentTimer -= dt;
            if (this.currentTimer <= 0) {
                this.inactive = this.block;
                this.block = !this.block;
                this.sprite.visible = this.block;
                if (!this.block)
                    this.currentTimer = this.timer;
            }
        }

        if (this._last_position.x !== this.position.x || this._last_position.y !== this.position.y) {
            this.rect.x = this.position.x - this.sprite.width * this.sprite.anchor.x;
            this.rect.y = this.position.y - this.sprite.height * this.sprite.anchor.y;
            this.rect.width = this.sprite.width;
            this.rect.height = this.sprite.height;
            this._last_position = this.position.clone();
        }
    };

    return FallBlock;
});
