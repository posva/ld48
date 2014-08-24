define(["lib/pixi", "lib/stats", "lib/proton", "lib/soundjs", "src/assets", "src/level", "src/const", "src/replayGuy"], function(PIXI, stats, proton, Sound, assets, Level, CONST, ReplayGuy) {
    var LevelSet = function() {
        this.levels = [];
        this.levelsData = [];
        this.currentLevel = 0;
        this.level = new Level();

        document.removeEventListener('keydown');
        document.removeEventListener('keyup');
        document.addEventListener('keydown', function(ev) { return onkey(ev, ev.keyCode, true);  }, false);
        document.addEventListener('keyup',   function(ev) { return onkey(ev, ev.keyCode, false); }, false);

        var that = this;
        function onkey(ev, key, down) {
            switch(key) {
                case CONST.KEY.LEFT:  that.level.dirs.left  = down; return false;
                case CONST.KEY.RIGHT: that.level.dirs.right = down; return false;
                case CONST.KEY.UP: that.level.dirs.jump  = down; return false;
                case CONST.KEY.R:
                    if (that.level.restart && !down) {
                        that.level.restart = 0;
                        that.level.clean();
                        that.level.init();
                    } else {
                        that.level.restart = down;
                    }
                    return false;
            }
        }

        var addDimension = function() {
            that.level.dimension++;
            if (that.level.dimension >= that.level.spawn.length) {
                that.level.clean();
                that.level.init();
                // TODO some animation pls
                return 0;
            }
            var sp = that.level.spawn[that.level.dimension-1];
            var i = 2;
            while (!sp) {
                sp = that.level.spawn[that.level.dimension-(i++)];
            }
            var r = new ReplayGuy(sp);
            that.level.camera.addChild(r.sprite);
            that.level.replays.push(r);
            that.level.timer = that.level.currentTimer = 0;

            //replace guy
            i = 0;
            sp = that.level.spawn[that.level.dimension];
            while (!sp) {
                sp = that.level.spawn[that.level.dimension-(i++)];
            }
            that.level.guy.position.x = sp.x;
            that.level.guy.position.y = sp.y;
            that.level.history[that.level.dimension] = [];
            that.level.sort();
        };

        document.removeEventListener('guyDeath');
        document.addEventListener('guyDeath', addDimension);

        document.removeEventListener('replayEnd');
        document.addEventListener('replayEnd', function(ev) {
            that.level.addBlock(ev.detail.position, ev.detail.block);
        });

        this.createLevels();
    };

    LevelSet.prototype.nextLevel = function() {
        this.currentLevel++;
        this.loadCurrent();
    };

    LevelSet.prototype.loadCurrent = function() {
        var ld = this.levels[this.currentLevel],
        ldp = this.levelsData[this.currentLevel];
        if (this.level) {
            this.level.destroy();
        }
        var lvl = new Level();
        lvl.setLevelData(ld.width, ld.height, ld.lvl);
        if (ldp.platforms) lvl.setPlatformData(ldp.platforms);
        lvl.init();
        lvl.sort();
        this.level = lvl;
    };

    LevelSet.prototype.previousLevel = function() {
        this.currentLevel--;
        if (this.currentLevel < 0) this.currentLevel = 0;
        this.loadCurrent();
    };

    LevelSet.prototype.createLevels = function() {
        this.levels.push({
            width: 32,
            height: 32,
            lvl: "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"+
                 "B        1               5   4 B"+
                 "B   0    TT             BB     B"+
                 "B                              B"+
                 "B        TT             BB     B"+
                 "B                              B"+
                 "B        TT             BB     B"+
                 "B                              B"+
                 "B        TT             BB     B"+
                 "B                              B"+
                 "B        TT   FFF       BB     B"+
                 "B                              B"+
                 "B        TT             BB     B"+
                 "B               FFFF           B"+
                 "B        TT             BB     B"+
                 "B                              B"+
                 "B        TT             BB     B"+
                 "B                              B"+
                 "B        TT             BB     B"+
                 "B                              B"+
                 "B        TT             BB     B"+
                 "B                              B"+
                 "B        TT      FSFF   BB     B"+
                 "B                              B"+
                 "B                              B"+
                 "B                           D  B"+
                 "B             2          FFFFFFB"+
                 "B             BBBB             B"+
                 "B BBB                          B"+
                 "B                        BBBBBBB"+
                 "B                    BBBSBBSSBBB"+
                 "BBBBBBBBSSSSBBBBBBBBBBBBBBBBBBBB"
        });
        this.levelsData.push({});
    };

    return LevelSet;
});
