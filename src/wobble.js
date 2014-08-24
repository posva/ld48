define(["lib/pixi", "lib/proton", "lib/soundjs", "src/assets"], function(PIXI, proton, Sound, assets) {
  var Wobble = function(val, force, friction) {
    val = val || 0;
    force = force || 0.5;
    friction = friction || 0.5;

    this.val = val;
    this.valTo = val;
    this.force = force;
    this.friction = friction;
    this._spd = 0;
  };

  Wobble.prototype.update = function(dt) {
    dt /= 100;
    this._spd += (this.force * dt) * (this.valTo - this.val);
    this._spd *= 1 - Math.min(this.friction * dt, 1);
    this.val += dt * this._spd;
  };

  return Wobble;
});
