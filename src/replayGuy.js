define(["lib/pixi", "lib/proton", "lib/soundjs", "src/assets", "src/const"], function(PIXI, proton, Sound, assets, CONST) {
    var ReplayGuy = function(x, y) {
        if (x && typeof x === "object") {
            y = x.y;
            x = x.x;
        } else {
            x = x || 0;
            y = y || 0;
        }

        this.timer = 0;
        this.currentTimer = 0;
        this.replay = true;
        this.type = "replay";
        this.sprite = new PIXI.Sprite(assets.guy);
        this.position = this.sprite.position;
        this._last_position = this.position.clone();
        this.sprite.anchor.set(0, 0);
        this.sprite.position.set(x + this.sprite.anchor.x * this.sprite.width,
                                 y + this.sprite.anchor.y * this.sprite.height);
                                 this.rect = new PIXI.Rectangle(x - this.sprite.width * this.sprite.anchor.x,
                                                                y - this.sprite.height * this.sprite.anchor.y,
                                                                this.sprite.width, this.sprite.height);
    };

    ReplayGuy.prototype.update = function(dt, replay) {
        if (this.replay) {
            this.currentTimer += dt;
            while (this.currentTimer > CONST.TIMER_INTERVAL) {
                this.currentTimer -= CONST.TIMER_INTERVAL;
                var p = replay[Math.floor((this.timer + CONST.TIMER_INTERVAL) / CONST.TIMER_INTERVAL)];
                if (p) {
                    this.sprite.position = p.clone();
                    this.timer += CONST.TIMER_INTERVAL;
                } else {
                    this.replay = false;
                    replay.splice(0);
                    return;
                }
            }
        }
    };

    return ReplayGuy;
});
