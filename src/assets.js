define(["lib/pixi", "lib/soundjs"], function(PIXI, Sound) {
    var assets = {
        loaded: 0,
        toLoad: 0,
    };

    assets.sounds = ["sound/hurt.ogg", "sound/platform.ogg"];
    assets.soundsName = ["hurt", "platform"];
    assets.textures = ["image/guy.png", "image/block.png", "image/spikes.png", "image/jumpable.png"];
    assets.texturesName = ["guy", "block", "spikes", "jumpable"];
    assets.fonts = ["data/font.fnt"];

    assets.toLoad = assets.sounds.length + assets.textures.length + 1 + assets.fonts.length;

    assets.load = function(stage, render, fun) {
        var loader = new PIXI.AssetLoader(this.textures.concat(this.fonts));
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

        var logo = new PIXI.Sprite.fromImage("image/logo.png");
        logo.position.set(render.width/2, render.height/2-h/2);
        logo.anchor.set(0.5, 1.1);
        stage.addChild(logo);
        logo.moveUp = true;
        logo.speed = 0;
        logo.start = logo.position.clone();
        logo.move = function(dt) {
            if (logo.moveUp && logo.position.y < logo.start.y - 48) {
                logo.moveUp = false;
                logo.speed *= 0.6;
            } else if (!logo.moveUp && logo.position.y >= logo.start.y) {
                logo.moveUp = true;
                logo.speed *= 0.6;
            }
            logo.position.y += logo.speed * dt;
            logo.speed += 0.001 * (logo.moveUp ? -1 : 1) * dt;
            if (logo.speed > 20) logo.speed = 20;
            if (logo.speed < -20) logo.speed = -20;
        };
        stage.logo = logo;

        var updateProgress = function() {
            that.loaded++;
            progress.clear();
            progress.beginFill(0xffffff);
            progress.drawRect(render.width/2-w/2,
            render.height/2-h/2,
            w * (that.loaded/that.toLoad), h);
            if (that.loaded >= that.toLoad) {
                //setTimeout(function() {
                delete stage.logo;
                fun();
                //}, 5000);
            }
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

        // Load them google fonts before starting...!
        WebFontConfig = {
          google: {
            families: [ 'Snippet', 'Arvo:700italic', 'Podkova:700' ]
          },

          active: function() {
            loader.load();
          }

        };
        (function() {
            var wf = document.createElement('script');
            wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
                '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
            wf.type = 'text/javascript';
            wf.async = 'true';
            var s = document.getElementsByTagName('script')[0];
            s.parentNode.insertBefore(wf, s);
        })();

        var handleFileLoad = function(event) {
            updateProgress();
        };

        Sound.addEventListener("fileload", handleFileLoad);

        for (i = 0; i < that.sounds.length; i++) {
            Sound.registerSound(that.sounds[i], that.soundsName[i]);
        }
    };

    return assets;
    
});
