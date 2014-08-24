define(["lib/pixi", "lib/proton", "lib/soundjs", "src/assets", "src/const"], function(PIXI, proton, Sound, assets, CONST) {
    var Exit = function(x, y) {
        if (x && typeof x === "object") {
            y = x.y;
            x = x.x;
        } else {
            x = x || 0;
            y = y || 0;
        }

        this.type = "door";
        this.R = 16;
        this.tha = 0;
        this.x = x;
        this.y = y;
        this.direction = 1;
        this.entering = 0;
        function createImageEmitter(x, y, color1, color2) {
            var emitter = new Proton.BehaviourEmitter();
            emitter.rate = new Proton.Rate(new Proton.Span(5, 7), new Proton.Span(0.01, 0.02));
            emitter.addInitialize(new Proton.Mass(1));
            emitter.addInitialize(new Proton.Life(0.3));
            emitter.addInitialize(new Proton.ImageTarget(assets.circle));
            emitter.addInitialize(new Proton.Radius(40));
            emitter.addBehaviour(new Proton.Alpha(1, 0));
            emitter.addBehaviour(new Proton.Color(color1, color2));
            emitter.addBehaviour(new Proton.Scale(0.6, 0));
            //emitter.addBehaviour(new Proton.CrossZone(new Proton.RectZone(0, 0, CONST.WIDTH * CONST.TILE, CONST.HEIGHT * CONST.TILE), 'cross'));

            emitter.p.x = x;
            emitter.p.y = y;
            proton.addEmitter(emitter);
            emitter.emit();
            return emitter;
        }
        this.e1 = createImageEmitter(this.x + this.R, this.y, '#4F1500', '#0029FF');
        this.e2 = createImageEmitter(this.x - this.R, this.y, '#004CFE', '#6600FF');
        this.rect = new PIXI.Rectangle(x - CONST.TILE/2,
                                       y - CONST.TILE/2,
                                       CONST.TILE, CONST.TILE);
    };

    Exit.prototype.destroy = function() {
        this.e1.destroy();
        this.e2.destroy();
    };

    Exit.prototype.update = function(dt) {
        dt /= 100;
        if (this.entering) {
            this.direction = -1;
            this.R -= 1 * dt;
            if (this.R <=0) {
                this.R = 0;
                this.e1.destroy();
                this.e2.destroy();
                this.entering = 0;
                document.dispatchEvent(new CustomEvent('endLevel'));
            }
        }
        this.e1.p.x = this.x + this.R * Math.sin(Math.PI / 2 + this.tha);
        this.e1.p.y = this.y + this.R * Math.cos(Math.PI / 2 + this.tha);

        this.e2.p.x = this.x + this.R * Math.sin(-Math.PI / 2 + this.tha);
        this.e2.p.y = this.y + this.R * Math.cos(-Math.PI / 2 + this.tha);
        this.tha += this.direction * 1.4 * dt;
    };

    return Exit;
});
