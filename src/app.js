define(["lib/pixi", "lib/stats", "lib/proton", "lib/soundjs", "src/assets", "src/level", "src/const"],
       function(PIXI, stats, proton, Sound, assets, Level, CONST) {
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
                stage = new PIXI.Stage(0x66FF99);
                PIXI.stage = stage;
                window.PIXI = PIXI; // XXX Testing
                window.stage = stage;
                renderer.onProtonUpdate = function() {

                };
                renderer.onParticleCreated = function(particle) {
                    var particleSprite = new PIXI.Sprite(particle.target);
                    particle.sprite = particleSprite;
                    PIXI.stage.addChild(particle.sprite);
                };

                renderer.onParticleUpdate = function(particle) {
                    transformSprite(particle.sprite, particle);
                };

                renderer.onParticleDead = function(particle) {
                    PIXI.stage.removeChild(particle.sprite);
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
                while (delta > step) {
                    lvl.update(Math.min(delta, step));
                    delta -= step;
                }
                pixiRender.render(PIXI.stage);
                stats.end();
                lastTime = now;
            };

            // clean container
            document.getElementById('container').textContent = "";
            addStats();
            createRender();
            // TODO add tick here? do the work on asset load + function
            assets.load(PIXI.stage, pixiRender);
            lvl = new Level();
            lvl.setLevelData(32, 10,
                             "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"+
                             "B        1               5   4 B"+
                             "B   0    TT             BB     B"+
                             "B                              B"+
                             "B             2                B"+
                             "B             BBBB             B"+
                             "B BBB                          B"+
                             "B                        BBBBBBB"+
                             "B                    BBBSBBSSBBB"+
                             "BBBBBBBBSSSSBBBBBBBBBBBBBBBBBBBB"
                            );
            lvl.init();
            tick();
        }
    };
});
