define(["lib/pixi", "lib/stats", "lib/proton", "lib/soundjs", "src/assets", "src/level", "src/const", "src/replayGuy"], function(PIXI, stats, proton, Sound, assets, Level, CONST, ReplayGuy) {
    var LevelSet = function() {
        this.levels = [];
        this.levelsData = [];
        this.currentLevel = 0;
        this.level = null;

        document.addEventListener('keydown', function(ev) { return onkey(ev, ev.keyCode, true);  }, false);
        document.addEventListener('keyup',   function(ev) { return onkey(ev, ev.keyCode, false); }, false);

        var that = this;
        function onkey(ev, key, down) {
            if (!that.level.canMove) return;
            switch(key) {
                case CONST.KEY.LEFT:  that.level.dirs.left  = down; return false;
                case CONST.KEY.RIGHT: that.level.dirs.right = down; return false;
                case CONST.KEY.UP: that.level.dirs.jump  = down; return false;
                case CONST.KEY.R:
                    if (that.level.restart && !down) {
                        that.level.restart = 0;
                        that.loadCurrent();
                    } else {
                        that.level.restart = down;
                    }
                    return false;
                case 78: // N
                    if (that.nextPressed && !down) {
                        that.nextPressed = 0;
                        that.nextLevel();
                    } else {
                        that.nextPressed = down;
                    }
                    return false;
                case 80: // P
                    if (that.previousPressed && !down) {
                        that.previousPressed = 0;
                        that.previousLevel();
                    } else {
                        that.previousPressed = down;
                    }
                    return false;
            }
        }

        var addDimension = function() {
            that.level.dimension++;
            if (that.level.dimension >= that.level.spawn.length) {
                that.loadCurrent();
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

        document.addEventListener('guyDeath', addDimension);

        document.addEventListener('replayEnd', function(ev) {
            that.level.addBlock(ev.detail.position, ev.detail.block);
        });

        document.addEventListener('endLevel', function() {
            that.nextLevel();
        });

        this.createLevels();
    };

    LevelSet.prototype.nextLevel = function() {
        this.currentLevel++;
        if (this.currentLevel >= this.levels.length) this.currentLevel--;
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
        if (ldp.texts) {
            for (i = 0; i < ldp.texts.length; i++) {
                var text = new PIXI.BitmapText(ldp.texts[i].str, { font: ldp.texts[i].size+"px Megafont", aligh: "left"});
                text.z = 1;
                text.position.x = ldp.texts[i].x;
                text.position.y = ldp.texts[i].y;
                PIXI.camera.addChild(text);
            }
        }
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
            width: 22,
            height: 15,
            lvl: "BBBBBBBBBBBBBBBBBBBBBB"+
                 "B  0                 B"+
                 "B                    B"+
                 "B                    B"+
                 "B                    B"+
                 "BBBBBBB              B"+
                 "B                    B"+
                 "B                    B"+
                 "B                    B"+
                 "B                    B"+
                 "B                    B"+
                 "B                    B"+
                 "B                    B"+
                 "B                  E B"+
                 "BBBBBBBBBBBBBBBBBBBBBB"
        });
        this.levelsData.push({
            texts: [
                {
                x: 48,
                y: 32 * 10,
                str: "Get to the portal",
                size: 35
                }
            ]
        });

        this.levels.push({
            width: 24,
            height: 15,
            lvl: "BBBBBBBBBBBBBBBBBBBBBBBB"+
                 "B                      B"+
                 "B                      B"+
                 "B                      B"+
                 "B                      B"+
                 "B                      B"+
                 "B                  E   B"+
                 "B              BBBBBB  B"+
                 "B             BBBBBB   B"+
                 "B                      B"+
                 "B                      B"+
                 "B                      B"+
                 "B  0                   B"+
                 "B        SSSSSSSSSSSSSSB"+
                 "BBBBBBBBBBBBBBBBBBBBBBBB"
        });
        this.levelsData.push({
            texts: [
                {
                x: 48,
                y: 32 * 9,
                str: "You can double jump",
                size: 35
                },
                {
                x: 48,
                y: 32 * 11,
                str: "Avoid spikes",
                size: 35
                }
            ]
        });

        this.levels.push({
            width: 24,
            height: 15,
            lvl: "BBBBBBBBBBBBBBBBBBBBBBBB"+
                 "B                      B"+
                 "B                      B"+
                 "B                      B"+
                 "B                      B"+
                 "B                      B"+
                 "B                      B"+
                 "B                      B"+
                 "B                      B"+
                 "B                      B"+
                 "B                      B"+
                 "B                      B"+
                 "B  0                   B"+
                 "B                      B"+
                 "BBBBBBBBBBBBBBBBBBBBBBBB"
        });
        this.levelsData.push({
            texts: [
                {
                x: 48,
                y: 32 * 7,
                str: "Use 'R' to restart\n'N' to skip the level\n'P' to play the\nprevious one",
                size: 35
                }
            ]
        });

        this.levels.push({
            width: 32,
            height: 32,
            lvl: "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"+
                 "B   B B                        B"+
                 "B   B B                        B"+
                 "B   B B                        B"+
                 "B   B B                        B"+
                 "B   B B                        B"+
                 "B   B B                        B"+
                 "B   B B                        B"+
                 "B   B0B   1                    B"+
                 "B   B B                        B"+
                 "B   B B                        B"+
                 "B   B B                        B"+
                 "B   B B                        B"+
                 "B   B B                        B"+
                 "B   B B                        B"+
                 "B   B B                        B"+
                 "B   B B                        B"+
                 "B   B B                        B"+
                 "B   B B                        B"+
                 "B   B B                        B"+
                 "B   B B                        B"+
                 "B   B B                        B"+
                 "B   B B                        B"+
                 "B   B B                        B"+
                 "B   B B                        B"+
                 "B   B B                     E  B"+
                 "B   B B                  BBBBBBB"+
                 "B   B B                        B"+
                 "B   B B                        B"+
                 "B   B B                  BBBBBBB"+
                 "B   BSB              BBBSBBSSBBB"+
                 "BBBBBBBBSSSSBBBBBBBBBBBBBBBBBBBB"
        });
        this.levelsData.push({
            texts: [
                {
                x: 48,
                y: 32 * 10,
                str: "Now, Die",
                size: 35
                }
            ]
        });

        this.levels.push({
            width: 33,
            height: 13,
            lvl: "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"+
                 "B                               B"+
                 "B                               B"+
                 "B                               B"+
                 "B                               B"+
                 "B                               B"+
                 "B                               B"+
                 "B                               B"+
                 "B                               B"+
                 "B                               B"+
                 "B                      S        B"+
                 "B  3   SSSSSSSSSSSSSSSSS   E    B"+
                 "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
        });
        this.levelsData.push({
            texts: [
                {
                x: 48,
                y: 32 * 7,
                str: "Trust yourself, use yourself...",
                size: 27
                }
            ]
        });


        this.levels.push({
            width: 33,
            height: 13,
            lvl: "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"+
                 "B                               B"+
                 "B                               B"+
                 "B    E                          B"+
                 "B   FFFF   F   F   F    FFFF    B"+
                 "B                               B"+
                 "B                               B"+
                 "B                 FFFSSSSSSSSSSSB"+
                 "B               SSSSSSSSSSSSSSSSB"+
                 "B         FFFSSSSSSSSSSSSSSSSSSSB"+
                 "B         SSSSSSSSSSSSSSSSSSSSSSB"+
                 "B  0   SSSSSSSSSSSSSSSSSSSSSSSSSB"+
                 "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
        });
        this.levelsData.push({
            texts: [
                {
                x: 48,
                y: 32 * 7,
                str: "These won't kill you",
                size: 27
                }
            ]
        });

        this.levels.push({
            width: 24,
            height: 15,
            lvl: "BBBBBBBBBBBBBBBBBBBBBBBB"+
                 "B1                     B"+
                 "BBBBBBBBBBBBBBBBBBBBBBFB"+
                 "BS                     B"+
                 "BBBBBBBBBBBBBBBBBBBBBBBB"+
                 "                        "+
                 "                        "+
                 "                        "+
                 "BBBBBBBBBB       FFFFFFF"+
                 "B     FFSB       F2   EB"+
                 "B     FFFB       FFFFFFB"+
                 "B     FFFB             B"+
                 "B  0     B             B"+
                 "B        B             B"+
                 "BBBBBBBBBB             B"
        });
        this.levelsData.push({
        });


        this.levels.push({
            width: 40,
            height: 36,
            lvl: "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"+
                 "BAAA      ZBX        AAAAAAAA          B"+
                 "B    B     A                           B"+
                 "B    B                                 B"+
                 "BFFFFB          ZX                     B"+
                 "B    B     S         FSFSF             B"+
                 "B    B    ZBX   S    BBBBX             B"+
                 "BFFFFB     A    A    BBBBX             B"+
                 "B 1  B          B    BBBBX             B"+
                 "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB B"+
                 "B                                   ZX Z"+
                 "B                                   ZX Z"+
                 "B   B                               ZX Z"+
                 "BFFFB                               ZX Z"+
                 "BFFFB                               ZX Z"+
                 "BFFFB                               ZX Z"+
                 "BFFFB                               ZX Z"+
                 "BFFFB                               ZX Z"+
                 "BFFFBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB  ZX Z"+
                 "BFFFFFFFFFFFFFEFFFFFFFFFFFFFFFFFBB  ZX Z"+
                 "BFFFBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB  ZX Z"+
                 "BFFFBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB BBFB"+
                 "BBBBB                                  B"+
                 "BBBB                                   B"+
                 "BFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFB"+
                 "BSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSB"+
                 "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
        });
        this.levelsData.push({
        });

        this.levels.push({
            width: 40,
            height: 36,
            lvl: "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"+
                 "B 0  ZX   ZBX        AAAAAAAA          B"+
                 "B    ZX    A                           B"+
                 "B    ZX                                B"+
                 "B    ZXE        ZX                 T   B"+
                 "B    ZX    S         FSFSF             B"+
                 "B    ZX   ZBX   S    BBBBX         F   B"+
                 "B    ZX    A    A    BBBBX             B"+
                 "B    ZX         B    BBBBX             B"+
                 "B    ZXBBBBBBBBBBBBBBBBBBBBBBBBBBBTTBBBB"+
                 "B    ZX                             BBBB"+
                 "B    ZX     TTBBBBBB      F     F   BBBB"+
                 "B    ZX     AA                      BBBB"+
                 "B    ZX                             BBBB"+
                 "B    ZX                             BBBB"+
                 "B    ZX     TT                      BBBB"+
                 "B    ZX                             BBBB"+
                 "B    ZX                             BBBB"+
                 "B    ZBBBBBBBBFBBBBB  BBBBBBBBBBBBBBBBBB"+
                 "B    ZFFFFFFFFFFFFFF  FFFFFFFFFFBBBBBBBB"+
                 "B    ZBBBBBBBBBBBBBB  BBBBBBBBBBBBBBBBBB"+
                 "B    ZBBBBBBBBBBBBBBTTBBBBBBBBBBBBBBBBFB"+
                 "B     AAAAAAAAAAAAAA                   B"+
                 "B                                      B"+
                 "B    FFFFBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"+
                 "BSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSB"+
                 "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
        });
        this.levelsData.push({
        });

        this.levels.push({
            width: 40,
            height: 13,
            lvl: "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"+
                 "B           ZB   A          ZB         B"+
                 "B           ZB              ZB         B"+
                 "B0  S   S   ZBT        F    ZB   S     B"+
                 "BBBBBBBBB    A   ZF         ZF  TB     B"+
                 "BE      B        ZX              SF  ZBB"+
                 "B       BX      FZX S S S S S S SBX    B"+
                 "B  FF   BB      FZX B B B B B    B      "+
                 "B  FF   BB       ZX BSBSBBB      B      "+
                 "B       BSSSSBSSSZBBBBBBBBBBBBBBBB     B"+
                 "BBBBBB  BBBBBBBBBBBBBBBBBBBBBBBBBBBBBFBB"+
                 "B                                      B"+
                 "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
        });
        this.levelsData.push({
        });

        this.levels.push({
            width: 41,
            height: 12,
            lvl: "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"+
                 "B   AAA          B                 F   FB"+
                 "B 1                                F   ZB"+
                 "BSF     BSSSSSSSBB          F    S Z   ZB"+
                 "B  B   ZBFFFFFFFBX          F   ZX Z   ZB"+
                 "B  B   ZBFFFFFFFBX ZB       F   ZX Z   ZB"+
                 "B  B   ZBFFFFFFFBX ZB       A   ZX Z   ZB"+
                 "BSSBSSSBBFFFFFFFBX ZB   S       ZX Z   ZB"+
                 "BBBBBBBBBBBBBBBBBXSBBBBSSB      ZX Z   ZB"+
                 "BBBBBBBBBBBBBBBBBBBBBBBBBBB   BBBBBBBX BB"+
                 "BBBBBBBBBBBBBBBBBBBBBBBBBBBSSSBBBBBBBBEBB"+
                 "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
        });
        this.levelsData.push({
        });

        this.levels.push({
            width: 40,
            height: 36,
            lvl: "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"+
                 "B                                      B"+
                 "B                                      B"+
                 "B                                      B"+
                 "B                                      B"+
                 "B                                      B"+
                 "B                                      B"+
                 "B                                      B"+
                 "B 0                                   SB"+
                 "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"+
                 "                                        "+
                 "                                        "+
                 "                                        "+
                 "                                        "+
                 "                                        "+
                 "                                        "+
                 "                                        "+
                 "                                        "+
                 "                                        "+
                 "                                        "+
                 "                                        "+
                 "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"+
                 "B1                                     B"+
                 "B                                      B"+
                 "BFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFB"+
                 "B                                      B"+
                 "B                                      B"+
                 "BFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFB"+
                 "B                                      B"+
                 "B                                      B"+
                 "BFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFB"+
                 "B                                      B"+
                 "B                                      B"+
                 "BFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFB"+
                 "B                                      B"+
                 "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
        });
        this.levelsData.push({
            texts: [
                {
                x: 48,
                y: 32 * 5,
                str: "Thanks for playing! I hope you enjoyed it. This game was made for the Ludum Dare 48.",
                size: 13
                },
                {
                x: 32 * 28,
                y: 32 * 11,
                str: "You can now enjoy some explosions :D. Go die for it!",
                size: 13
                },
                {
                x: 48,
                y: 32 * 22,
                str: "RUUUUUUN!",
                size: 32
                }
            ]
        });
        this.levelsData.push({});
    };

    return LevelSet;
});
