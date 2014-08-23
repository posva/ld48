define(["lib/pixi", "lib/soundjs"], function(PIXI, Sound) {
    var assets = {};
    var loaded = 0, toLoad;

    assets.sounds = ["sound/hurt.ogg"];
    assets.soundsName = ["hurt"];
    assets.textures = ["image/guy.png", "image/block.png", "image/spikes.png", "image/jumpable.png"];
    assets.texturesName = ["guy", "block", "spikes", "jumpable"];

    toLoad = assets.sounds.length + assets.textures.length;

    assets.load = function(stage, render) {
        var backRect = new PIXI.Graphics(),
        w = 320, h = 80;
        backRect.lineStyle(2, 0x0c0c0c, 1);
        backRect.drawRect(render.width/2-w/2,
            render.height/2-h/2,
            w, h);
        stage.addChild(backRect);

        var i;
        for (i = 0; i < this.textures.length; i++) {
            this[this.texturesName[i]] = new PIXI.Texture.fromImage(this.textures[i]);
        }
        for (i = 0; i < this.sounds.length; i++) {
            Sound.registerSound(this.sounds[i], this.soundsName[i]);
        }
        var handleFileLoad = function(event) {
            // A sound has been preloaded.
            console.log("Preloaded:", event.id, event.src);
        };

        Sound.addEventListener("fileload", handleFileLoad);
    };

    return assets;
    
});
