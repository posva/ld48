define(["lib/pixi", "lib/soundjs"], function(PIXI, Sound) {
    var assets = {};
    var loaded = 0, toLoad;

    assets.sounds = ["sound/hurt.ogg"];
    assets.textures = ["images/bunny.png"];
    assets.music = ["sound/music.mp3"];

    toLoad = assets.sounds.length + assets.textures.length + assets.music.length;

    assets.load = function(stage, render) {
        var backRect = new PIXI.Graphics(),
        w = 320, h = 80;
        backRect.lineStyle(2, 0x0c0c0c, 1);
        console.log(stage.width);
        console.log(stage);
        backRect.drawRect(render.width/2-w/2,
            render.height/2-h/2,
            w, h);
        stage.addChild(backRect);
    };

    return assets;
    
});