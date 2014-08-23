define(["lib/pixi", "lib/proton", "lib/soundjs", "src/assets"], function(PIXI, proton, Sound, assets) {
    var Platform = function(x, y, jumpable) {
        if (x && typeof x === "object") {
            jumpable = y;
            y = x.y;
            x = x.x;
        } else {
            x = x || 0;
            y = y || 0;
            jumpable = jumpable || false;
        }

        this.type = "platform";
        this.currentTimer = -1;
        this.block = true;
        this.sound = Sound.play("platform", {loop: -1});
        this.jumpable = jumpable;
        this.sprite = new PIXI.Sprite(assets.block);
        this.position = this.sprite.position;
        this._last_position = this.position.clone();
        this.sprite.anchor.set(0, 0);
        this.sprite.position.set(x, y);
        this.rect = new PIXI.Rectangle(x - this.sprite.width * this.sprite.anchor.x,
                                       y - this.sprite.height * this.sprite.anchor.y,
                                       this.sprite.width, this.sprite.height);
    };

    // do from > to from left to right
    Platform.prototype.movement = function(from, to, speed, timer) {
        this.speed = speed || 10;
        this.timer = timer || 2000;
        this.from = from.clone && from.clone();
        this.to = to.clone && to.clone();
        this.direction = this.to.clone();
        this.direction.x -= this.from.x;
        this.direction.y -= this.from.y;
        var sc = 1/this.direction.x, sc2 = 1/this.direction.y;
        if (sc2 < sc) sc = sc2;
        this.direction.x *= sc;
        this.direction.y *= sc;
        this.goTo = true;
    };

    Platform.prototype.update = function(dt) {
        if (this.currentTimer >= 0) {
            this.currentTimer -= dt;
            if (this.currentTimer < 0) {
                this.sound.resume();
            }
        } else if (this.goTo && (Math.abs(this.position.x - this.to.x) < 0.5 || this.position.x >= this.to.x) && (Math.abs(this.position.y - this.to.y) < 0.5 || this.position.x >= this.to.y)) {
            this.goTo = false;
            this.currentTimer = this.timer;
            this.sound.pause();
        } else if (!this.goTo && (Math.abs(this.position.x - this.from.x) < 0.5 || this.position.x <= this.from.x) && (Math.abs(this.position.y - this.from.y) < 0.5 || this.position.y <= this.from.y)) {
            this.goTo = true;
            this.currentTimer = this.timer;
            this.sound.pause();
        }

        if (this.currentTimer < 0) {
            dt /= 100;
            this.position.x += (this.goTo ? 1 : -1) * this.speed * this.direction.x * dt;
            this.position.y += (this.goTo ? 1 : -1) * this.speed * this.direction.y * dt;
        }

        if (this._last_position.x !== this.position.x || this._last_position.y !== this.position.y) {
            this.rect.x = this.position.x - this.sprite.width * this.sprite.anchor.x;
            this.rect.y = this.position.y - this.sprite.height * this.sprite.anchor.y;
            this.rect.width = this.sprite.width;
            this.rect.height = this.sprite.height;
            this._last_position = this.position.clone();
        }

    };

    return Platform;
});
