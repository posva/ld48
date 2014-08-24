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
        this.timer = 2500;
        this.block = true;
        this.activated = false;
        this.animation = new PIXI.MovieClip(assets.explosion);
        this.animation.visible = 0;
        this.animation.z = 2;
        this.animation.anchor.set(0.5, 0.5);
        this.animation.animationSpeed = 0.25;
        this.animation.loop = 0;
        this.animation.onComplete = function() {
            this.visible = 0;
        };

        this.inactive = false;
        this.sprite = new PIXI.MovieClip(assets.fall);
        this.sprite.loop = 0;
        this.sprite.playing = 0;
        var that = this;
        this.sprite.onComplete = function() {
            if (that.activated) {
                this.gotoAndPlay(0);
                Sound.play("bip");
            }
        };
        this.position = this.sprite.position;
        this._last_position = this.position.clone();
        this.sprite.anchor.set(0, 0);
        this.sprite.position.set(x, y);
        this.rect = new PIXI.Rectangle(x - this.sprite.width * this.sprite.anchor.x,
                                       y - this.sprite.height * this.sprite.anchor.y,
                                       this.sprite.width, this.sprite.height);
        this.animation.position.x = this.position.x + this.sprite.width/2;
        this.animation.position.y = this.position.y + this.sprite.height/2;

        var i;
        this.emitter = [];
        for (i = 0; i < assets.fallExplo.length; i++) {
            this.emitter[i] = new Proton.BehaviourEmitter();
            this.emitter[i].rate = new Proton.Rate(1);
            this.emitter[i].addInitialize(new Proton.Mass(1));
            this.emitter[i].addInitialize(new Proton.ImageTarget(assets.fallExplo[i]));
            this.emitter[i].addInitialize(new Proton.Life(2, 3));
            this.emitter[i].addInitialize(new Proton.Velocity(new Proton.Span(1, 3), new Proton.Span(0, 30, true), 'polar'));

            this.emitter[i].addBehaviour(new Proton.Gravity(5));
            this.emitter[i].addBehaviour(new Proton.Alpha(1, 0.5));
            this.emitter[i].addBehaviour(new Proton.Rotate(0, Proton.getSpan(-1, 1), 'add'));
            this.emitter[i].p.x = this.animation.position.x;
            this.emitter[i].p.y = this.animation.position.y;
            proton.addEmitter(this.emitter[i]);
            //this.emitter[i].emit('once');
        }
    };

    FallBlock.prototype.activate = function() {
        if (this.currentTimer <= 0) {
            this.currentTimer = 750;
            this.sprite.gotoAndPlay(0);
            this.sprite.animationSpeed = 0.05;
            this.activated = true;
            Sound.play("bip");
        }
        //start some animation
    };

    FallBlock.prototype.update = function(dt) {
        if (this.currentTimer > 0) {
            this.currentTimer -= dt;
            this.sprite.animationSpeed *= 1.05;
            if (this.currentTimer <= 0) {
                this.inactive = this.block;
                this.block = !this.block;
                this.animation.rotation = Math.random() * 2 * Math.PI;
                this.sprite.visible = this.block;
                if (!this.block) {
                    this.animation.visible = true;
                    this.animation.rotation = Math.random() * 2 * Math.PI;
                    this.animation.gotoAndPlay(0);
                    this.currentTimer = this.timer;
                    Sound.play("explosion");
                    var tmp = (Math.random() > 0.5 ? 1 : -1) * Math.random() * Math.PI/10;
                    PIXI.camera.rotation += tmp;
                    this.activated = false;
                    var i;
                    for (i = 0; i < assets.fallExplo.length; i++) {
                        this.emitter[i].emit('once');
                    }
                } else {
                    this.sprite.gotoAndStop(0);
                }
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
