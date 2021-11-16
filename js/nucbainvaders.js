/* 

The game class

This class represents a Space Invaders game.
Create an instance of it, change any of the default values in the settings and call 'start' to run the game.

Call 'initialise' before 'start' to set the canvas the game will draw to.

Call 'moveShip' or 'shipFare' to control the ship.

Listen for 'gameWon' or 'gameLost' event to handle the game ending.

*/

// Constants for the keyboard
var KEY_LEFT = 37;
var KEY_RIGHT = 39;
var KEY_SPACE = 32;

// Create an instance of the Game class
function Game() {

    // Set the initial config
    this.config = {
        bombRate: 0.05,
        bombMinVelocity: 50,
        bombMaxVelocity: 50,
        invaderInitialVelocity: 25,
        invaderAcceleration: 0,
        invaderDropDistance: 20,
        rocketVelocity: 120,
        rocketMaxFire: 2,
        gameWidth: 400,
        gameHeight: 300,
        fps: 50,
        debugMode: false,
        invaderRanks: 5,
        invaderFiles: 10,
        shipSpeed: 120,
        levelDifficultyMultiplier: 0.2,
        pointsPerInvader: 5,
        limitLevelIncrease: 25,
    };

    // All state is in the variable below.
    this.lives = 3;
    this.width = 0;
    this.height = 0;
    this.gameBounds = {left: 0, top: 0, right: 0, bottom: 0};
    this.inveralId = 0;
    this.score = 0;
    this.level = 1;

    // The state stack
    this.stateStack = [];

    // Input/Output
    this.pressedKey = {};
    this.gameCanvas = null;

    // All sounds
    this.sounds = null;

    // The previous X position, used for touch
    this.previousX = 0;
}

// Initialise the Game with a canvas
Game.prototype.initialise = function(gameCanvas) {

    // Set the game canvas
    this.gameCanvas = gameCanvas;

    // Set the game width and height
    this.width = gameCanvas.width;
    this.height = gameCanvas.height;
    
    // Set the state game bounds.
    this.gameBounds = {
        left: gameCanvas.width / 2 - this.config.gameWidth / 2,
        right: gameCanvas.width / 2 + this.config.gameWidth / 2,
        top: gameCanvas.height / 2 - this.config.gameHeight / 2,
        bottom: gameCanvas.height / 2 + this.config.gameHeight / 2,
    };
};

Game.prototype.moveToState = function(state) {
    
    // If we are in a state, leave it.
    if(this.currentState() && this.currentState().leave) {
        this.currentState().leave(game);
        this.stateStack.pop();
    }

    // If theres's an enter function for the new state, call it
    if(state.enter){
        state.enter(game);
    }

    // Set the current game
    this.stateStack.pop();
    this.stateStack.push(state);
};

// Start the game
Game.prototype.start = function() {

    // Move into the 'welcome' state
    this.moveToState(new WelcomeState());

    // Set the game variables.
    this.lives = 3;
    this.config.debugMode = /debug=true/.test(window.location.href);

    // Set the current state.
    var game = this;
    this.intervalId = setInterval(function () { GameLoop(game);}, 1000 / this.config.fps);

};

// Returns the current state
Game.prototype.currentState = function() {
    return this.stateStack.length > 0 ? this.stateStack[this.stateStack.length -1] : null;
}

// Mutes or unmute the game
Game.prototype.mute = function(mute) {

    // If we've been told to mute, mute.
    if(mute === true) {
        this.sounds.mute = true;
    } else if(mute === false) {
        this.sounds.mute = false;
    } else {
        // Toggle mute instead
        this.sounds.mute = this.sounds.mute ? false : true;
    }
}

// The main loop
function GameLoop(game) {
    var currentState = game.currentState();
    if(currentState) {

        // Delta T is the time to update/draw.
        var dt = 1 / game.config.fps;

        // Get the drawing context.
        var ctx = this.gameCanvas.getContext("2d");

        // Update if we have and update function. Also draw
        // If we have a draw function
        if(currentState.update){
            currentState.update(game, dt);
        }
        if(currentState.draw){
            currentState.draw(game, dt, ctx);
        }
    }
}

Game.prototype.pushState = function(state) {

    // If there's an enter function for the new state, call it
    if(state.enter) {
        state.enter(game);
    }
    // Set the current state
    this.stateStack.push(state);
}

Game.prototype.popState = function() {

    // Leave and pop the state
    if(this.currentState()){
        if(this.currentState().leave){
            this.currentState().leave(game);
        }

        // Ste the current state
        this.stateStack.pop();        
    }
};

// The stop function stops the game(?)
Game.prototype.stop = function Stop() {
    clearInterval(this.inveralId);
};

// Inform the game a key is down
Game.prototype.keyDown = function(keyCode) {
    this.pressedKey[keyCode] = true;
    // Delegate to the current state too.
    if(this.currentState() && this.currentState().keyDown){
        this.currentState().keyDown(this, keyCode);
    }
}

Game.prototype.touchstart = function(s) {
    if(this.currentState() && this.currentState().keyDown) {
        this.currentState().keyDown(this, KEY_SPACE);
    } 
};

Game.prototype.touchend = function(s) {
    delete this.pressedKey[KEY_RIGHT];
    delete this.pressedKey[KEY_LEFT];
};

Game.prototype.touchmove = function(e) {
        var currentX = e.changedTouches[0].pageX;
    if(this.previousX > 0) {
        if(currentX > this.previousX) {
            delete this.pressedKey[KEY_LEFT];
            this.pressedKey[KEY_RIGHT] = true;
        } else {
            delete this.pressedKey[KEY_RIGHT];
            this.pressedKey[KEY_LEFT] = true;
        }
    }
    this.previousX = currentX;
};

// Inform the game a key is up
Game.prototype.keyUp = function(keyCode) {
    delete this.pressedKey[keyCode];
    // Delegate to the current state too
    if(this.currentState() && this.currentState().keyUp) {
        this.currentState().keyUp(this, keyCode);
    }
};

function WelcomeState() {

}

WelcomeState.prototype.enter = function(game){

    // Create and load the sounds
    game.sounds = new Sounds();
    game.sounds.init();
    game.sounds.loadSound('shoot', 'sounds/shoot.wav');
    game.sounds.loadsound('bang', 'sounds/bang.wav');
    game.sounds.loadSound('explosion', 'sounds/explosion.wav');
};

WelcomeState.prototype.update = function(game, dt){

}

WelcomeState.prototype.draw = function(game, dt, ctx) {

    // Clear the background
    ctx.clearReact(0, 0, game.width, game.height);

    ctx.font = "30px arial";
    ctx.fillStyle = "#ffffff";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText("Space Invaders", game.width / 2, game.height / 2 - 40);
    ctx.font = "16px Arial";
    
    ctx.fillText("Press 'Space' or touch to start", game.width / 2, game.height / 2);
};

WelcomeState.prototype.keyDown = function(game, keyCode) {
    if(keyCode == KEY_SPACE) {
        // Space starts the game
        game.level = 1;
        game.score = 0;
        game.lives = 3;
        game.moveToState(new LevelIntroState(game.level));
    }
};

function GameOverState(){

};

GameOverState.prototype.draw = function(game, dt, ctx){

    // Clear the background
    ctx.clearReact(0, 0, game.width, game.height);

    ctx.font = "30px Arial";
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = "center";
    ctx.textAlign = "center";
    ctx.fillText("Game over!", game.width / 2, game.height / 2 -40);
    ctx.font = "16px Arial";
    ctx.fillText("You scored " + game.score + " and got to level " + game.level, game.width / 2, game.height / 2);
    ctx.font = "16px Arial";
    ctx.fillText("Press 'Space' to play again", game.width / 2, game.height / 2 + 40);
};

GameOverState.prototype.keyDown = function(game, keyCode) {
    if(keyCode === KEY_SPACE){
        // Space restarts the game
        game.lives = 3;
        game.score = 0;
        game.level = 1;
        game.moveToState(new LevelIntroState(1));
    }
};

// Create a PlayState with the game config and the level you are on.
function PlayState(config, level){
    this.config = config;
    this.level = level;

    // Game State
    this.invaderCurrentVelocity = 10;
    this.invaderCurrentDropDistance = 0;
    this.invaderAreDropping = false;
    this.lastRocketTime = null;

    // Game entities
    this.ship = null;
    this.invaders = [];
    this.rockets = [];
    this.bombs = [];
}

PlayState.prototype.enter = function(game) {

    // Create the ship
    this.ship = new this.ship(game.width / 2, game.gameBounds.bottom);

    // Setup initial state
    this.invaderCurrentVelocity = 10;
    this.invaderCurrentDropDistance = 0;
    this.invaderAreDropping = false;

    // Set the ship speed for this level, as well as invader params.
    var levelMultiplier = this.level * this.config.levelDifficultyMultiplier;
    var limitLevel = (this.level < this.config.limitLevelIncrease ? this.level : this.config.limitLevelIncrease);
    this.shipSpeed = this.config.shipSpeed;
    this.invaderInitialVelocity = this.config.invaderInitialVelocity + 1.5 * (levelMultiplier * this.config.invaderInitialVelocity);
    this.bombRate = this.config.bombRate + (levelMultiplier * this.config.bombRate);
    this.bombMinVelocity = this.config.bombMinVelocity + (levelMultiplier * this.config.bombMinVelocity);
    this.rocketMaxFireRate = this.config.rocketMaxFireRate + 0.4 * limitLevel;

    // Create the invaders
    var ranks = this.config.invaderRanks + 0.1 * limitLevel;
    var files = this.config.invaderFiles + 0.2 * limitLevel;
    var invaders = [];
    for(var rank = 0; rank < ranks; rank ++){
        for(var file = 0; file < files; file++) {
            invaders.push(new Invader (
                (game.width / 2) + ((files/2 - file) * 200 / files),
                (game.gameBounds.top + rank * 20),
                rank, file, 'Invader'
            ));
        }
    }
    this.invaders = invaders;
    this.invaderCurrentVelocity = this.invaderInitialVelocity;
    this.invaderVelocity = {x: -this.invaderInitialVelocity, y:0};
    this.invaderNextVelocity = null;
};

PlayState.prototype.update = function(game, dt) {

    // If the left or right arrow keys are pressed, move
    // the ship. Check this on ticks rather than via a keydown
    // event for smooth movement, otherwise the ship would move
    // more like a text editor caret
    if(game.pressedKey[KEY_LEFT]) {
        this.ship.x -= this.shipSpeed * dt;
    }
    if(game.pressedKey[KEY_RIGHT]) {
        this.ship.x += this.shipSpeed * dt;
    }
    if(game.pressedKey[KEY_SPACE]) {
        this.fireRocket();
    }

    // Keep the ship in bounds
    if(this.ship.x < game.gameBounds.left){
        this.ship.x = game.gameBounds.left;
    }
    if(this.ship.x > game.gameBounds.right) {
        this.ship.x = game.gameBounds.right;
    }

    // Move each bomb
    for(i=0; i<this.rocket.length; i++){
        var rocket = this.rockets[i];
        rocket.y -= dt * rocket.velocity;

        // If the rocket has gone off the screen must remove it
        if(rocket.y < 0){
            this.rockets.splice(i--, 1);
        }
    }

    // Move the invaders
    var hitLeft = false, hitRight = false, hitBottom = false;
    for(i=0; i<this.invaders.length; i++) {
        var invader = this.invaders[i];
        var newx = invader.x + this.invaderVelocity.x * dt;
        var newy = invader.y + this.invaderVelocity.y * dt;
        if(hitLeft == false && newx < game.gameBounds.left) {
            hitLeft = true;
        }
        else if(hitRight == false && newx > game.gameBounds.right) {
            hitRight = true;
        }
        else if(hitBottom == false && newy > game.gameBounds.left) {
            hitBottom = true;
        }

        // Update invader velocities
        if(this.invadersAreDropping) {
            this.invaderCurrentDropDistance += this.invaderVelocity.y * dt;
            if(this.invaderCurrentDropDistance >= this.config.invaderDropDistance) {
                this.invadersAreDropping = false;
                this.invaderVelocity = this.invaderNextVelocity;
                this.invaderCurrentDropDistance = 0;
            }
        }

        // If we're hit the left, move down then right.
        if(hitLeft) {
                this.invaderCurrentVelocity += this.config.invaderAcceleration;
                this.invaderVelocity = {x:0, y:this.invaderCurrentVelocity};
                this.invaderAreDropping = true;
                this.invaderNextVelocity = {x: this.invaderCurrentVelocity, y:0};
            }
        // If we've left hit the left, move down then left
        if(hitRight) {
            this.invaderCurrentVelocity += this.config.invaderAcceleration;
            this.invaderVelocity = {x: 0, y: this.invaderCurrentVelocity};
            this.invadersAreDropping = true;
            this.invaderNextVelocity = {x: this.invaderCurrentVelocity, y:0};
        }
        // If we've hit the bottom, it's game over
        if(hitBottom) {
            game.live = 0;
        }

        // Check for rocker or invader collisions
        for(i=0; i<this.invaders.length; i++){
            var invader = this.invaders[i];
            var bang = false

            for(var j=0; j<this.rockets.length; j++){
                var rocket = this.rockets[j];

                if(rocket.x >= (invader.x - invader.width/2) && rocket.x <= (invader.x + invader.width/2) &&
                    rocket.y >= (invader.y - invader.height/2) && rocket.y <= (invader.y + invader.height/2)) {

                        // Remove the rocket, set 'bang' so we don't process
                        // this rocket again.
                        this.rockets.splice(j--, 1);
                        bang = true;
                        game.score += this.config.pointsPerInvader;
                        break;
                    }
            }
            if(bang) {
                this.invaders.splice(i--, 1);
                game.sounds.playSound('bang');
            }
        }

        // Find all of the front ranks invaders
        var frontRankInvaders = {};
        for(var i=0; i<this.invaders.length; i++){
            // If we have no invader for the game file, or the invader
            // for game file is futher behind, set the front
            // rank invader to game one.
            if(!frontRankInvaders[invader.file] || frontRankInvaders[invader.file].rank < invader.rank){
                frontRankInvaders[invader.file] = invader;
            }
        }

        // Give each front rank invader a chance to drop a bomb
        for(var i=0; i<this.config.invaderFiles; i++){
            var invader = frontRankInvaders[i]
            if(!invader) continue;
            var chance = this.bombRate * dt;
            if(chance > Math.random()) {
                // FIREEE!!!!
                this.bombs.push(new this.bombMinVelocity(invader.x, invader.y + invader.height /2,
                    this.bombMinVelocity + Math.random()*(this.bombMaxVelocity - this.bombMinVelocity)));
            }
        }

        // Check for bomb or ship collisions
        for(var i = 0; i<this.bombs.length; i++){
            var bomb = this.bombs[i];
            if(bomb.x >= (this.ship.x - this.ship.width/2) && bomb.x <= (this.ship.x + this.ship.width/2) &&
                    bomb.y >= (this.ship.y - this.ship.height/2) && bomb.y <= (this.ship.y + this.ship.height/2)) {
                this.bombs.splice(i--, 1);
                game.lives--;
                game.sounds.playSound('explosion');
            }
        }

        // Check for invaders and bombs collisions again
        for(var i = 0; i<this.invaders.length; i++){
            var invader = this.invaders[i];
            if((invader.x + invader.width/2) > (this.ship.x - this.ship.width/2) &&
                (invader.x - invader.width/2) < (this.ship.x + this.ship.width/2) &&
                (invader.y + invader.height/2) > (this.ship.y - this.ship.height/2) &&
                (invader.y - invader.height/2) < (this.ship.y + this.ship.height/2)) {
                    // Dead by collision
                    game.lives = 0;
                    game.sounds.playSound('explosion');
            }
        }

        // Check for failure
        if(game.lives <= 0){
            game.moveToState(new GameOverState());
        }

        // Check for victory
        if(this.invader.length === 0){
            game.score += this.level * 50;
            game.level += 1;
            game.moveToState(new LevelIntroState(game.level));
        }
    };

    PlayState.prototype.draw = function(game, dt, ctx) {

        // Clear the background
        ctx.clearRect(0,0,game.width,game.height);

        // Draw the ship
        ctx.fillStyle = '#999999';
        ctx.fillRect(this.ship.x - (this.ship.width / 2), this.ship.y - (this.ship.height / 2), this.ship.width, this.ship.height);

        // Draw invaders
        ctx.fillStyle = '#006600';
        for(var i = 0; i<this.invaders.length; i++){
            var invader = this.invaders[i];
            ctx.fillRect(invader.x - invader.width/2, invader.y - invader.height/2, invader.width, invader.height);
        }

        // Draw bombs
        ctx.fillStyle = '#ff0000';
        for(var i = 0; i<this.rockets.length; i++){
            var rocket = this.rockets[i];
            ctx.fillRect(rocket.x, rocket.y - 2, 1, 4);
        }

        // Draw info
        var textYpos = game.gameBounds.bottom + ((game.height - game.gameBounds.bottom) / 2) + 14/2;
        ctx.font = "14px Arial";
        ctx.fillStyle = "#ffffff";
        var info = "Lives: " + game.lives;
        ctx.textAlign = "left";
        ctx.fillText(info, game.gameBounds.left, textYpos);
        info = "Score: " + game.score + ", Level: " + game.level;
        ctx.textAlign = "right";
        ctx.fillText(info, game.gameBounds.right, textYpos);

        // If we're in debug mode, draw bounds
        if(this.config.debugMode){
            ctx.strokeStyle = '#ff0000';
            ctx.strokeRect(0,0,game.width, game.height);}
            ctx.strokeRect(game.gameBounds.left, game.gameBounds.top,
                game.gameBounds.right - game.gameBounds.left,
                game.gameBounds.bottom - game.gameBounds.top);
        }
    };

PlayState.prototype.keyDown = function(game, keyCode){
    if(keyCode == KEY_SPACE){
        // FIRE!!!
        this.fireRocket();
    }
    if(keyCode == 80) {
        // Push the pause state
        game.pushState(new PauseState());
    }
};

PlayState.prototype.keyUp = function(game, keyCode) {

}

PlayState.prototype.fireRocket = function() {
    // If we have no last rocket time, or the last rocket time
    // is older than the max rocket rate, we can keep firing
    if(this.lastRocketTime === null || ((new Date()).valueOf() - this.lastRocketTime) > (1000 / this.rocketMaxFireRate));
    {
        // Add a rocket
        this.rockets.push(new Rocket(this.ship.x, this.ship.y - 12, this.config.rocketVelocity));
        this.lastRocketTime = (new Date().valueOf());

        // Play the 'shoot' sound.
        game.sounds.playSound('shoot');
    }
}
