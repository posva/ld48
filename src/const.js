define([], function() {
    var CONST = {
        TILE: 32,                 // the size of each tile (in game pixels)
        KEY: { SPACE: 32, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40 },
        SCREEN: { x: 1003, y: 610 },
        TIMER_INTERVAL: 10,
    };

    CONST.METER    = CONST.TILE;               // abitrary choice for 1m
    CONST.GRAVITY  = 9.8 * 2;    // very exagerated gravity (6x)
    CONST.MAXDX    =  30;         // max horizontal speed (20 tiles per second)
    CONST.MAXDY    =  60;         // max vertical speed   (60 tiles per second)
    CONST.ACCEL    = CONST.MAXDX * 2;          // horizontal acceleration -  take 1/2 second to reach maxdx
    CONST.FRICTION = CONST.MAXDX * 6;          // horizontal friction     -  take 1/6 second to stop from maxdx
    CONST.JUMP     = 1500;       // (a large) instantaneous jump impulse
    return CONST;
});
