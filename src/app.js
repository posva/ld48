define(["lib/pixi", "lib/stats", "lib/proton", "lib/soundjs", "src/assets"], function(PIXI, stats, Proton, Sound, assets) {
    return {
        start: function() {
            var canvas;
            var context;
            var proton;
            var emitter;
            var pixiStage;
            var pixiRender;

            var addStats = function() {
                stats.setMode(2);
                stats.domElement.style.position = 'absolute';
                stats.domElement.style.left = '0px';
                stats.domElement.style.top = '0px';
                document.getElementById('container').appendChild(stats.domElement);
            };

            var loadData = function() {
                Sound.registerSound({id:"hurt", src:"sound/hurt.ogg"});
                Sound.registerSound("sound/hurt.ogg", "ay");
                Sound.registerSound("sound/music.mp3", "music");

                var handleFileLoad = function(event) {
                    // A sound has been preloaded.
                    console.log("Preloaded:", event.id, event.src);
                };
                Sound.addEventListener("fileload", handleFileLoad);
            };

            var createProton = function() {
                var texture = new PIXI.Texture.fromImage("image/bunny.png");
                proton = new Proton();
                emitter = new Proton.BehaviourEmitter();
                emitter.rate = new Proton.Rate(new Proton.Span(75, 110), new Proton.Span(.2, .5));
                emitter.addInitialize(new Proton.Mass(1));
                emitter.addInitialize(new Proton.ImageTarget(texture));
                emitter.addInitialize(new Proton.Life(2, 3));
                emitter.addInitialize(new Proton.Velocity(new Proton.Span(3, 9), new Proton.Span(0, 30, true), 'polar'));

                emitter.addBehaviour(new Proton.Gravity(8));
                emitter.addBehaviour(new Proton.Scale(new Proton.Span(1, 3), 0.3));
                emitter.addBehaviour(new Proton.Alpha(1, 0.5));
                emitter.addBehaviour(new Proton.Rotate(0, Proton.getSpan(-8, 9), 'add'));
                emitter.p.x = 1003 / 2;
                emitter.p.y = 100;
                emitter.emit();
                proton.addEmitter(emitter);

                emitter.addSelfBehaviour(new Proton.Gravity(5));
                emitter.addSelfBehaviour(new Proton.RandomDrift(30, 30, .1));
                emitter.addSelfBehaviour(new Proton.CrossZone(new Proton.RectZone(50, 0, 953, 610), 'bound'));
            };

            var createRender = function() {
                var renderer = new Proton.Renderer('other', proton);
                pixiRender = PIXI.autoDetectRenderer(1003, 610);
                document.getElementById('container').appendChild(pixiRender.view);
                pixiStage = new PIXI.Stage(0x66FF99);
                window.stage = pixiStage;
                renderer.onProtonUpdate = function() {

                };
                renderer.onParticleCreated = function(particle) {
                    var particleSprite = new PIXI.Sprite(particle.target);
                    particle.sprite = particleSprite;
                    pixiStage.addChild(particle.sprite);
                };

                renderer.onParticleUpdate = function(particle) {
                    transformSprite(particle.sprite, particle);
                };

                renderer.onParticleDead = function(particle) {
                    pixiStage.removeChild(particle.sprite);
                };
                renderer.start();

                // create a new Sprite using the texture
                var bunny = new PIXI.Sprite(new PIXI.Texture.fromImage("image/bunny.png"));

                // center the sprites anchor point
                bunny.anchor.x = 0.5;
                bunny.anchor.y = 0.5;

                // move the sprite t the center of the screen
                bunny.position.x = 200;
                bunny.position.y = 150;

                pixiStage.addChild(bunny);
                window.bunny = bunny;

            };

            function transformSprite(particleSprite, particle) {
                particleSprite.position.x = particle.p.x;
                particleSprite.position.y = particle.p.y;
                particleSprite.scale.x = particle.scale;
                particleSprite.scale.y = particle.scale;
                particleSprite.anchor.x = 0.5;
                particleSprite.anchor.y = 0.5;
                particleSprite.alpha = particle.alpha;
                particleSprite.rotation = particle.rotation * Math.PI / 180;
            };

            function tick() {
                requestAnimationFrame(tick);

                stats.begin();
                proton.update();
                pixiRender.render(pixiStage);
                stats.end();
            };

            // clean container
            document.getElementById('container').textContent = "";
            loadData();
            addStats();
            createProton();
            createRender();
            // TODO add tick here? do the work on asset load + function
            assets.load(pixiStage, pixiRender);
            tick();
        }
    };
});