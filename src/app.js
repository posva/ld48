define(["lib/pixi", "lib/stats", "lib/proton", "lib/soundjs", "src/assets", "src/levelSet", "src/const"],
       function(PIXI, stats, proton, Sound, assets, LevelSet, CONST) {
    return {
        start: function() {
            var canvas;
            var context;
            var emitter;
            var stage;
            var pixiRender;
            var lvl;
            var step = 15;
            var lastTime = Date.now(), delta = 0;

            var addStats = function() {
                stats.setMode(2);
                stats.domElement.style.position = 'absolute';
                stats.domElement.style.left = '-100px';
                stats.domElement.style.top = '0px';
                document.getElementById('container').appendChild(stats.domElement);
            };

            var createRender = function() {
                var renderer = new Proton.Renderer('other', proton);
                pixiRender = PIXI.autoDetectRenderer(CONST.SCREEN.x, CONST.SCREEN.y);
                document.getElementById('container').appendChild(pixiRender.view);
                stage = new PIXI.Stage(0x101010);
                PIXI.stage = stage;
                window.PIXI = PIXI; // XXX Testing
                window.stage = stage;
                renderer.onProtonUpdate = function() {

                };
                renderer.onParticleCreated = function(particle) {
                    var particleSprite = new PIXI.Sprite(particle.target);
                    particle.sprite = particleSprite;
                    PIXI.camera.addChild(particle.sprite);
                };

                renderer.onParticleUpdate = function(particle) {
                    transformSprite(particle.sprite, particle);
                };

                renderer.onParticleDead = function(particle) {
                    PIXI.camera.removeChild(particle.sprite);
                };
                renderer.start();
            };

            var updateProtonBindings = function() {
            };

            var transformSprite = function(particleSprite, particle) {
                particleSprite.position.x = particle.p.x;
                particleSprite.position.y = particle.p.y;
                particleSprite.scale.x = particle.scale;
                particleSprite.scale.y = particle.scale;
                particleSprite.anchor.x = 0.5;
                particleSprite.anchor.y = 0.5;
                particleSprite.z = 5;
                particleSprite.alpha = particle.alpha;
                particleSprite.rotation = particle.rotation * Math.PI / 180;
            };

            var tick = function() {
                var now = Date.now();
                delta = now - lastTime;
                window.delta = delta;
                requestAnimationFrame(tick);

                stats.begin();
                proton.update();
                while (lvl && delta > step) {
                    lvl.level.update(Math.min(delta, step));
                    delta -= step;
                }
                if (stage.logo) {
                    stage.logo.move(delta);
                }
                pixiRender.render(PIXI.stage);
                stats.end();
                lastTime = now;
            };

            // clean container
            document.getElementById('container').textContent = "";
            addStats();
            createRender();
            assets.load(PIXI.stage, pixiRender, function() {
                lvl = new LevelSet();
                lvl.loadCurrent();
                //lvl.setPlatformData([
                    //{
                    //from: new PIXI.Point(32, 128),
                    //to: new PIXI.Point(128, 128),
                    //jumpable: true,
                    //speed: 10,
                    //timer: 2000,
                    //}
                //]);

            });
            tick();
        }
    };
});
