define(["lib/pixi", "lib/proton", "lib/soundjs", "src/assets", "src/const", "src/guy", "src/jumpable", "src/block", "src/spikes", "src/replayGuy", "src/platform", "src/fallBlock", "src/wobble" ], function(PIXI, proton, Sound, assets, CONST, Guy, Jumpable, Block, Spikes, ReplayGuy, Platform, FallBlock, Wobble) {
    var Level = function() {
        this.guy = null;
        this.blocks = [];
        this.platforms = [];
        this.falls = [];
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
        this.restart = 0;
        this.wobbleCamX = new Wobble(0, CONST.CAMFORCE, CONST.CAMFRICTION);
        this.wobbleCamY = new Wobble(0, CONST.CAMFORCE, CONST.CAMFRICTION);
        this.wobbleCamRot = new Wobble(0, CONST.CAMFORCE, CONST.CAMFRICTION);



        this.ambientEmiter = new Proton.Emitter();
        this.ambientEmiter.damping = 0.0075;
        this.ambientEmiter.addInitialize(new Proton.ImageTarget(assets.particle));
        this.ambientEmiter.addInitialize(new Proton.Mass(1), new Proton.Radius(Proton.getSpan(5, 10)));

        this.repulsionBehaviour = new Proton.Repulsion({x: 0, y: 0}, 0, 0);
        this.ambientEmiter.addBehaviour(new Proton.Scale(Proton.getSpan(0.1, 0.6)));
        this.ambientEmiter.addBehaviour(new Proton.Alpha(0.5));
        this.ambientEmiter.addBehaviour(new Proton.RandomDrift(0, 10, 0.5));
        this.ambientEmiter.addBehaviour(new Proton.Color('random'));
        this.ambientEmiter.addBehaviour({
            initialize : function(particle) {
                particle.tha = Math.random() * Math.PI;
                particle.thaSpeed = 0.015 * Math.random() + 0.005;
            },

            applyBehaviour : function(particle) {
                particle.tha += particle.thaSpeed;
                particle.alpha = Math.abs(Math.cos(particle.tha));
            }
        });
        proton.addEmitter(this.ambientEmiter);

    };

    function depthCompare(a,b) {
        a.z = a.z || 0;
        b.z = b.z || 0;
        if (a.z < b.z)
            return -1;
        if (a.z > b.z)
            return 1;
        return 0;
    }

    Level.prototype.addBlock = function(position, block) {
        this.tileset[Math.floor(position.x / CONST.TILE) + Math.floor(position.y / CONST.TILE) * CONST.TILE] = block;
        block.block = true;
    };

    Level.prototype.destroy = function() {
        // TODO missing some shit
    }

    Level.prototype.sort = function() {
        this.camera.children.sort(depthCompare);
    };

    Level.prototype.setLevelData = function(width, height, lvl) {
        this.lvl.width = width;
        this.lvl.height = height;
        this.lvl.data = lvl.toUpperCase();
        var rect = new Proton.RectZone(0, 0, width * CONST.TILE, height * CONST.TILE);
        this.ambientEmiter.addInitialize(new Proton.Position(rect));
        this.ambientEmiter.p.x = 0;
        this.ambientEmiter.p.y = 0;
        this.crossZoneBehaviour = new Proton.CrossZone(rect, 'cross');
        this.ambientEmiter.rate = new Proton.Rate(width * height);
        this.ambientEmiter.addBehaviour(this.repulsionBehaviour, this.crossZoneBehaviour);
    };

    Level.prototype.setPlatformData = function(data) {
        this.platformData = data;
        var i;
        for (i = 0; i < this.platformData.length; i++) {
            this.platformData[i].jumpable = this.platformData[i].jumpable || true;
            this.platformData[i].speed = this.platformData[i].speed || 10;
            this.platformData[i].timer = this.platformData[i].timer || 2000;
        }
    };

    Level.prototype.clean = function() {
        this.tileset.splice(0);
        this.replays.splice(0);
        this.platforms.splice(0);
        this.falls.splice(0);
        this.spawn.splice(0);
        if (this.guy) {
            this.guy.sprite.removeStageReference();
            delete this.guy;
        }
        this.camera.removeStageReference();
        delete this.camera;
        delete this.stage;
        this.dimension = 0;
        this.ambientEmiter.particles.splice(0);
    };

    Level.prototype.init = function() {
        if (!this.stage) {
            this.stage = PIXI.stage = new PIXI.Stage(0x101010);
        }
        if (!this.camera) {
            this.camera = PIXI.camera = new PIXI.DisplayObjectContainer();
            this.stage.addChild(this.camera);

            this.ambientEmiter.emit('once');
        }
        
        // load Level
        var x, y, block, ind, spikes, pi = 0, pdata;
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
                } else if (this.lvl.data[ind] === "-") {
                    pdata = this.platformData[pi++];
                    block = new Platform(x * CONST.TILE, y * CONST.TILE, pdata.jumpable);
                    block.movement(pdata.from, pdata.to, pdata.speed, pdata.timer);
                    this.camera.addChild(block.sprite);
                    this.platforms.push(block);
                } else if (this.lvl.data[ind] === "F") { // Block
                    block = new FallBlock(x * CONST.TILE, y * CONST.TILE);
                    this.falls.push(block);
                    this.camera.addChild(block.sprite);
                    this.camera.addChild(block.animation);
                    this.tileset[ind] = block;
                }
            }
        }
        var sp = this.spawn[0], i = 0;
        while (!sp && i < 200) sp = this.spawn[0+(i++)];
        this.spawn[0] = sp; // allow single spawn
        this.guy = new Guy(sp);
        console.log(this.spawn);
        this.camera.addChild(this.guy.sprite);
        window.camera = this.camera; // XXX test
        CONST.WIDTH = this.lvl.width;
        CONST.HEIGHT = this.lvl.height;

        this.camera.position.set(CONST.SCREEN.x/2, CONST.SCREEN.y/2);
        this.history = [];
        this.history[0] = [];
        this.timer = 0;
        this.currentTimer = 0;
        window.his = this.history[0];
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
        for (i = 0; i < this.platforms.length; i++) {
            this.platforms[i].update(delta);
        }
        for (i = 0; i < this.falls.length; i++) {
            this.falls[i].update(delta);
        }
        this.guy.update(delta, this.tileset, this.dirs);
        this.repulsionBehaviour.reset(this.guy.position, 5, 100);
        this.wobbleCamRot.val = this.camera.rotation;
        this.wobbleCamX.update(delta);
        this.wobbleCamY.update(delta);
        this.wobbleCamRot.update(delta);
        this.wobbleCamX.valTo = this.guy.position.x;
        this.wobbleCamY.valTo = this.guy.position.y;
        this.camera.pivot.x = this.wobbleCamX.val;
        this.camera.pivot.y = this.wobbleCamY.val;
        this.wobbleCamRot.valTo = 0;
        this.camera.rotation = this.wobbleCamRot.val;
    };

    return Level;
});
