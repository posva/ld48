define(["lib/pixi", "lib/soundjs"], function(PIXI, Sound) {
    var assets = {
        loaded: 0,
        toLoad: 0,
    };

    assets.sounds = ["sound/hurt.ogg"];
    assets.soundsName = ["hurt"];
    assets.textures = ["image/guy.png", "image/block.png", "image/spikes.png", "image/jumpable.png"];
    assets.texturesName = ["guy", "block", "spikes", "jumpable"];

    assets.toLoad = assets.sounds.length + assets.textures.length;

    assets.load = function(stage, render, fun) {
        var loader = new PIXI.AssetLoader(this.textures);
        var that = this;
        var backRect = new PIXI.Graphics(),
        w = 320, h = 80;
        backRect.lineStyle(2, 0x0c0c0c, 1);
        backRect.drawRect(render.width/2-w/2,
            render.height/2-h/2,
            w, h);
        stage.addChild(backRect);

        loader.addEventListener('onProgress', function() {
            that.loaded++;
            if (that.loaded >= that.toLoad)
                fun();
        });

        loader.addEventListener('onComplete', function() {
            var i;
            for (i = 0; i < that.textures.length; i++) {
                that[that.texturesName[i]] = new PIXI.Texture.fromImage(that.textures[i]);
            }
        });

        loader.load();

        var handleFileLoad = function(event) {
            // A sound has been preloaded.
            console.log("Preloaded:", event.id, event.src);
            that.loaded++;
            if (that.loaded >= that.toLoad)
                fun();
        };

        Sound.addEventListener("fileload", handleFileLoad);

        for (i = 0; i < that.sounds.length; i++) {
            Sound.registerSound(that.sounds[i], that.soundsName[i]);
        }
    };

    return assets;
    
});
