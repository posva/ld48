define(["lib/pixi", "lib/proton", "lib/soundjs", "src/assets", "src/const", "src/guy", "src/jumpable", "src/block", "src/spikes", "src/replayGuy" ], function(PIXI, proton, Sound, assets, CONST, Guy, Jumpable, Block, Spikes, ReplayGuy) {
    var Level = function() {
        this.guy = null;
        this.blocks = [];
        this.lvl = {}; // Sey it manually
        this.tileset = [];
        this.spawn = [];
        this.replays = [];
        this.dimension = 0;
        this.dirs = {
            left: 0,
            right: 0,
            jump: 0
        };
        this.history = [];
        this.timer = 0;
        this.currentTimer = 0;
        this.maxTimer = 60 * 1000; // 1 min max recording

        document.addEventListener('keydown', function(ev) { return onkey(ev, ev.keyCode, true);  }, false);
        document.addEventListener('keyup',   function(ev) { return onkey(ev, ev.keyCode, false); }, false);

        var that = this;
        function onkey(ev, key, down) {
            switch(key) {
                case CONST.KEY.LEFT:  that.dirs.left  = down; return false;
                case CONST.KEY.RIGHT: that.dirs.right = down; return false;
                case CONST.KEY.UP: that.dirs.jump  = down; return false;
            }
        }

        var addDimension = function() {
            that.dimension++;
            if (that.dimension >= that.spawn.length) {
                // trigger death
                return 0;
            }
            var sp = that.spawn[that.dimension-1];
            var i = 2;
            while (!sp) {
                sp = that.spawn[that.dimension-(i++)];
            }
            var r = new ReplayGuy(sp);
            that.camera.addChild(r.sprite);
            that.replays.push(r);
            that.timer = that.currentTimer = 0;

            //replace guy
            i = 0;
            sp = that.spawn[that.dimension];
            while (!sp) {
                sp = that.spawn[that.dimension-(i++)];
            }
            that.guy.position.x = sp.x;
            that.guy.position.y = sp.y;
            that.history[that.dimension] = [];
        };

        document.addEventListener('guyDeath', addDimension);

    };

    Level.prototype.setLevelData = function(width, height, lvl) {
        this.lvl.width = width;
        this.lvl.height = height;
        this.lvl.data = lvl.toUpperCase();
    };

    Level.prototype.init = function() {
        this.stage = PIXI.stage = new PIXI.Stage(0x66FF99);
        this.camera = new PIXI.DisplayObjectContainer();
        this.stage.addChild(this.camera);

        // load Level
        var x, y, block, ind, spikes;
        for (y = 0; y < this.lvl.height; y++) {
            for (x = 0; x < this.lvl.width; x++) {
                ind = x + y * this.lvl.width;
                if (this.lvl.data[ind] === "B") { // Block
                    block = new Block(x * CONST.TILE, y * CONST.TILE);
                    this.blocks.push(block);
                    this.camera.addChild(block.sprite);
                    this.tileset[ind] = block;
                } else if (this.lvl.data.charCodeAt(ind) >= 48 && this.lvl.data.charCodeAt(ind) <= 57) { // spawn
                    this.spawn[parseInt(this.lvl.data[ind], 10)] = { x: x * CONST.TILE, y: y * CONST.TILE };
                } else if (this.lvl.data[ind] === "S") {
                    spikes = new Spikes(x * CONST.TILE, y * CONST.TILE);
                    this.camera.addChild(spikes.sprite);
                    this.tileset[ind] = spikes;
                } else if (this.lvl.data[ind] === "T") {
                    block = new Jumpable(x * CONST.TILE, y * CONST.TILE);
                    block.jumpable = true;
                    this.camera.addChild(block.sprite);
                    this.tileset[ind] = block;
                }
            }
        }
        this.guy = new Guy(this.spawn[this.dimension]);
        this.camera.addChild(this.guy.sprite);
        window.camera = this.camera;
        CONST.WIDTH = this.lvl.width;

        this.camera.position.set(CONST.SCREEN.x/2, CONST.SCREEN.y/2);
        this.history[this.dimension] = [];
        window.his = this.history[this.dimension];
    };

    Level.prototype.update = function(delta) {
        if (this.timer < this.maxTimer) {
            this.currentTimer += delta;
            while (this.currentTimer > CONST.TIMER_INTERVAL) {
                this.currentTimer -= CONST.TIMER_INTERVAL;
                this.history[this.dimension][Math.floor((this.timer + CONST.TIMER_INTERVAL) / CONST.TIMER_INTERVAL)] = this.guy.position.clone();
                this.timer += CONST.TIMER_INTERVAL;
            }
        }
        var i;
        for (i = 0; i < this.replays.length; i++) {
            this.replays[i].update(delta, this.history[i]);
        }
        delta /= 100;
        this.guy.update(delta, this.tileset, this.dirs);
        this.camera.pivot = this.guy.position.clone();
    };

    return Level;
});
