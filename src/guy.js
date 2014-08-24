define(["lib/pixi", "lib/proton", "lib/soundjs", "src/assets", "src/const"], function(PIXI, proton, Sound, assets, CONST) {
    var Guy = function(x, y) {
        if (x && typeof x === "object") {
            y = x.y;
            x = x.x;
        } else {
            x = x || 0;
            y = y || 0;
        }
        this.d = new PIXI.Point(0, 0);
        this.dd = new PIXI.Point(0, 0);
        this.falling = false;
        this.jumps = 2;

        this.type = "G";
        this.sprite = new PIXI.Sprite(assets.guy);
        this.sprite.z = 1;
        this.position = this.sprite.position;
        this._last_position = this.position.clone();
        this.sprite.anchor.set(0, 0);
        this.sprite.position.set(x + this.sprite.anchor.x * this.sprite.width,
                                 y + this.sprite.anchor.y * this.sprite.height);
                                 this.rect = new PIXI.Rectangle(x - this.sprite.width * this.sprite.anchor.x,
                                                                y - this.sprite.height * this.sprite.anchor.y,
                                                                this.sprite.width, this.sprite.height);
    };

    function bound(x, min, max) {
        return Math.max(min, Math.min(max, x));
    }

    Guy.prototype.update = function(dt, cells, dirs) {
        var wasleft  = this.d.x < 0,
        wasright = this.d.x > 0,
        falling  = this.falling;

        dt /=100;

        this.dd.x = 0;
        this.dd.y = CONST.GRAVITY;

        if (dirs.left)
            this.dd.x = this.dd.x - CONST.ACCEL;     // this wants to go left
        else if (wasleft)
            this.dd.x = this.dd.x + CONST.FRICTION;  // this was going left, but not any more

        if (dirs.right)
            this.dd.x = this.dd.x + CONST.ACCEL;     // this wants to go right
        else if (wasright)
            this.dd.x = this.dd.x - CONST.FRICTION;  // this was going right, but not any more

        if (!dirs.jump) {
            this.jumping = false;
        }
        if (dirs.jump && this.jumps > 0 && !this.jumping) {
            this.dd.y = this.dd.y - CONST.JUMP;     // apply an instantaneous (large) vertical impulse
            this.jumping = true;
            this.jumps--;
            Sound.play("jump");
        }

        this.position.y  = Math.floor(this.position.y  + (dt * this.d.y));
        this.position.x  = Math.floor(this.position.x  + (dt * this.d.x));
        this.d.x = bound(this.d.x + (dt * this.dd.x), -CONST.MAXDX, CONST.MAXDX);
        this.d.y = bound(this.d.y + (dt * this.dd.y), -CONST.MAXDY, CONST.MAXDY);

        if ((wasleft  && (this.d.x > 0)) ||
            (wasright && (this.d.x < 0))) {
            this.d.x = 0; // clamp at zero to prevent friction from making us jiggle side to side
        }

        var tx    = Math.floor(this.position.x/CONST.TILE),
        ty        = Math.floor(this.position.y/CONST.TILE),
        nx        = this.position.x % CONST.TILE,         // true if this overlaps right
        ny        = this.position.y % CONST.TILE,         // true if this overlaps below
        cell      = cells[tx + ty * CONST.WIDTH],
        cellright = cells[(1+tx) + ty * CONST.WIDTH],
        celldown  = cells[tx + (1+ty) * CONST.WIDTH],
        celldiag  = cells[(1+tx) + (1+ty) * CONST.WIDTH];

        if (cell) {
            if (cell.activate) cell.activate();
            if (cell.inactive) cell = undefined;
        }
        if (celldown) {
            if (celldown.activate) celldown.activate();
            if (celldown.inactive) celldown = undefined;
        }
        if (cellright) {
            if (cellright.activate) cellright.activate();
            if (cellright.inactive) cellright = undefined;
        }
        if (celldiag) {
            if (celldiag.activate) celldiag.activate();
            if (celldiag.inactive) celldiag = undefined;
        }

        if (this.position.y > CONST.TILE * CONST.HEIGHT || (cell && cell.type === "die" && this.collide(cell)) ||
            (celldown && celldown.type === "die" && this.collide(celldown)) ||
            (celldiag && celldiag.type === "die" && this.collide(celldiag)) ||
            (cellright && cellright.type === "die" && this.collide(cellright))) {
            Sound.play("hurt");
            document.dispatchEvent(new CustomEvent('guyDeath'));
            return true;
        }


        if (this.d.y > 0) {
            if ((celldown && !cell && celldown.block) ||
                (celldiag && !cellright && nx && celldiag.block)) {
                this.position.y = ty * CONST.TILE;       // clamp the y position to avoid falling into platform below
            if (this.falling) Sound.play("hit");
            this.d.y = 0;            // stop downward velocity
            this.falling = false;   // no longer falling
            this.jumping = false;   // (or jumping)
            this.jumps = 2;
            ny = 0;                   // - no longer overlaps the cells below
            }
        } else if (this.d.y < 0) {
            if ((cell      && !celldown && !cell.jumpable) ||
                (cellright && !celldiag && nx && !cellright.jumpable)
                ) {
                this.position.y = CONST.TILE * (ty + 1);   // clamp the y position to avoid jumping into platform above
            this.d.y = 0;            // stop upward velocity
            if (this.falling) Sound.play("hit");
            cell      = celldown;     // this is no longer really in that cell, we clamped them to the cell below 
            cellright = celldiag;     // (ditto)
            ny        = 0;            // this no longer overlaps the cells below
            }
        }

        if (this.d.x > 0) {
            if ((cellright && !cell && !cellright.jumpable) ||
                (celldiag  && !celldown && ny && !celldiag.jumpable)) {
                this.position.x = CONST.TILE * (tx);       // clamp the x position to avoid moving into the platform we just hit
            this.d.x = 0;            // stop horizontal velocity
            }
        } else if (this.d.x < 0) {
            if ((cell     && !cellright && !cell.jumpable) ||
                (celldown && !celldiag && ny && !celldown.jumpable)) {
                this.position.x = CONST.TILE * (tx + 1);  // clamp the x position to avoid moving into the platform we just hit
            this.d.x = 0;           // stop horizontal velocity
            }
        }

        this.falling = ! (celldown || (nx && celldiag));

        // updat Rect
        if (this._last_position.x !== this.position.x || this._last_position.y !== this.position.y) {
            this.rect.x = this.position.x - this.sprite.width * this.sprite.anchor.x;
            this.rect.y = this.position.y - this.sprite.height * this.sprite.anchor.y;
            this.rect.width = this.sprite.width;
            this.rect.height = this.sprite.height;
            this._last_position = this.position.clone();
        }


    };

    Guy.prototype.collide = function(rect) {
        rect = rect && rect.rect;
        if (!rect) return false;
        return !(rect.x > (this.rect.x + this.rect.width) || 
                 (rect.x + rect.width) < this.rect.x || 
                 rect.y > (this.rect.y + this.rect.height) ||
                 (rect.y + rect.height) < this.rect.y);
    };

    return Guy;
});
