define(["lib/pixi", "lib/soundjs"], function(PIXI, Sound) {
    var assets = {
        loaded: 0,
        toLoad: 0,
    };

    assets.sounds = ["sound/hurt.ogg"];
    assets.soundsName = ["hurt"];
    assets.textures = ["image/guy.png", "image/block.png", "image/spikes.png", "image/jumpable.png"];
    assets.texturesName = ["guy", "block", "spikes", "jumpable"];
    assets.fonts = ["data/font.fnt", "data/test.fnt"];

    assets.toLoad = assets.sounds.length + assets.textures.length + 1;

    assets.load = function(stage, render, fun) {
        var loader = new PIXI.AssetLoader(this.textures);
        (function() {
            var wf = document.createElement('script');
            wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
                '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
            wf.type = 'text/javascript';
            wf.async = 'true';
            var s = document.getElementsByTagName('script')[0];
            s.parentNode.insertBefore(wf, s);
        })();
        var that = this;
        var backRect = new PIXI.Graphics(),
        progress = new PIXI.Graphics(),
        w = 320, h = 80;
        backRect.lineStyle(2, 0x0c0c0c, 1);
        backRect.drawRect(render.width/2-w/2,
            render.height/2-h/2,
            w, h);
        stage.addChild(backRect);
        stage.addChild(progress);

        var updateProgress = function() {
            that.loaded++;
            progress.clear();
            progress.beginFill(0xffffff);
            progress.drawRect(render.width/2-w/2,
            render.height/2-h/2,
            w * (that.loaded/that.toLoad), h);
            if (that.loaded >= that.toLoad) fun();
        };

        loader.addEventListener('onProgress', function() {
            updateProgress();
        });

        loader.addEventListener('onComplete', function() {
            var i;
            for (i = 0; i < that.textures.length; i++) {
                that[that.texturesName[i]] = new PIXI.Texture.fromImage(that.textures[i]);
            }
            updateProgress();
        });

        loader.load();

        var handleFileLoad = function(event) {
            // A sound has been preloaded.
            console.log("Preloaded:", event.id, event.src);
            updateProgress();
        };

        Sound.addEventListener("fileload", handleFileLoad);

        for (i = 0; i < that.sounds.length; i++) {
            Sound.registerSound(that.sounds[i], that.soundsName[i]);
        }
    };

    return assets;
    
});
