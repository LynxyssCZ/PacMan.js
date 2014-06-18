/***********************************************************************/
// Map object
// Content of map.js
Game.Map = function (game, display, width, height) {
	this._game = game;
	this._display = display;
	this._width = width;
	this._height = height;
	this._objects = [];
	this._dirty = [];
	this._objectCount = [];
	this.clear();
};

// Clear Game state
Game.Map.prototype.clear = function() {
	for (var i = 0; i < this._width; i++) {
		this._objects[i] = [];
		this._dirty[i] = [];
	};
	this._objectCount = [];
	this._objectDefs = [];
	this._dynamics = [];
	this._player = null;
	this._foodCount = 0;
	this._started = false;
};

// Set scoreboard position and size
Game.Map.prototype.scoreBoard = function (x, y, size) {
	this._scoreX = x;
	this._scoreY = y;
	this._scoreSize = size;
};

/**
 * Add object definition
 */
Game.Map.prototype.defineObject = function (name, props) {
	if (this._objectDefs[name]) {
		throw "There is already a type of object named " + name + "!";
	}
	this._objectDefs[name] = props;
	this._objectCount[name] = 0;
};

// Get type count
Game.Map.prototype.getCount = function (type) {
	return this._objectCount[type];
};

// Add dynamic object to map
Game.Map.prototype.addDynamic = function(nx, ny, type) {
	var x = Math.floor(nx);
	var y = Math.floor(ny);
	if (!this._objectDefs[type])
		throw "There is no type of object named " + type + "!";
	var actor = new Game.DynamicObject(type, x, y, this._game, this);
	this._dynamics.push( actor );
};

// Place a static object into the grid
Game.Map.prototype.placeObject = function (nx, ny, type) {
	var x = Math.floor(nx);
	var y = Math.floor(ny);
	if (!this._objectDefs[type])
		throw "There is no type of object named " + type + "!";
	if ( x == this.getPlayerX() && y == this.getPlayerY() )
		throw "Cell occupied by a player!";

	if (typeof(this._objects[x][y]) === 'undefined') { // Cell empty
		this._objects[x][y] = type;
		this._dirty[x][y] = true;
		this._objectCount[type]++;
	} else { // Cell Is full
		throw "Cell " + x +":"+ y + " is already full!";
	}
};

// Destroy static object on given indices
Game.Map.prototype.destroyObject = function(nx, ny) {
	var x = Math.floor(nx);
	var y = Math.floor(ny);

	if (typeof(this._objects[x]) !== 'undefined') { // Row is instanced
		if (typeof(this._objects[x][y]) !== 'undefined') { // Cell is not empty
			this._objectCount[ this._objects[x][y] ]--;
			delete this._objects[x][y];
			this._dirty[x][y] = true;
			return true;
		}
	}
	return false;
};

// Place player into the grid
Game.Map.prototype.placePlayer = function (nx, ny, tile) {
	var x = Math.floor(nx);
	var y = Math.floor(ny);
	if (this._player){
		throw "Player already in place!";
	} else {
		this._player = new Game.Player(x, y, tile, this, this._game);
		this._game.add(this._player);
	}
};

// Player getter
Game.Map.prototype.getPlayer = function() {
	if (this._player) {return this._player;}
};

// Player X getter
Game.Map.prototype.getPlayerX = function() {
	if (this._player) { return this._player.getX(); };
};

// Player Y getter
Game.Map.prototype.getPlayerY = function() {
	if (this._player) { return this._player.getY(); };
};

// Object def getter
Game.Map.prototype.getDefinition = function(type) {
	return this._objectDefs[type];
};

// Redraw dirty parts of the map
Game.Map.prototype.draw = function( flip ) {
	var dirties = 0;
	for(var coll in this._dirty) {
		for(var row in this._dirty[coll]) {
			var objectDef = this._objectDefs[this._objects[coll][row]];
			delete this._dirty[coll][row];
			dirties++;
			if (typeof(objectDef) === 'undefined') {
				this._display.clearTile(coll, row);
				continue;
			};
			if ( objectDef.tile ) {
				if ( objectDef.frame ) {
					this._display.drawTile( coll, row, objectDef.tile, objectDef.frame, true );
				} else {
					this._display.drawTile( coll, row, objectDef.tile, 0, true );
				}
			}
			else if( objectDef.color ) {
				this._display.drawBlock( coll , row , 1, 1, objectDef.color);
			}
		}
	}
	if (this._player) {this._display.drawTile( this._player.getX(),
												this._player.getY(),
												this._player.getTile(),
												this._player.getFrame(flip),
												true );
						};
	
	for (key in this._dynamics) {
		var curr = this._dynamics[key];
		this._display.drawTile( curr.getX(), curr.getY(), curr.getTile(), curr.getFrame(flip), true );
	};

	if (this._scoreSize) {
		this._display.drawText(this._scoreX, this._scoreY, this._scoreSize, "Score:");
		this._display.drawText(this._scoreX, this._scoreY+this._scoreSize, this._scoreSize, this._player.getScore());
	};
};

// Check if object can move to given position
Game.Map.prototype.canMoveTo = function(nx, ny, type) {
	var x = Math.floor(nx);
	var y = Math.floor(ny);
	if (x >= this._width || y >= this._height || x < 0 || y < 0 ) {return false};

	if (typeof(this._objects[x]) === 'undefined') { // Row not instanced yet
		return true;
	} else if (typeof(this._objects[x][y]) === 'undefined') { // Cell empty
		return true;
	} else { // Cell Is occupied
		if( this._objectDefs[ this._objects[x][y] ].impassable  ) return false;
		else return true;
	}
};

// Return object at given coordinates (No player)
Game.Map.prototype.getObjectOn = function(nx, ny) {
	var x = Math.floor(nx);
	var y = Math.floor(ny);
	if (typeof(this._objects[x]) !== 'undefined') { // Row is instanced
		if (typeof(this._objects[x][y]) !== 'undefined') { // Cell is not empty
			return this._objectDefs[this._objects[x][y]]; // Return object def
		}
	}

	for (key in this._dynamics) {
		var curr = this._dynamics[key];
		if (curr.getX() == x && curr.getY() == y) {
			return curr;
		};
	};
};

// Player move checks
Game.Map.prototype.playerMoveTo = function(nx, ny) {
	var x = Math.floor(nx);
	var y = Math.floor(ny);
	// Flag dirty block around player
	this._dirty[this._player.getX()][this._player.getY()] = true;
	this._dirty[x][y] = true;
	// Check dynamics collisions first
	for (key in this._dynamics) {
		var curr = this._dynamics[key];
		if (curr.getX() == x && curr.getY() == y) {
			return curr.onCollision(this._player);
		};
	};
	if (typeof(this._objects[x][y]) !== 'undefined') { // Cell is not empty
		if ( this._objectDefs[this._objects[x][y]].onCollision ) {
			this._objectDefs[this._objects[x][y]].onCollision({x:x, y:y}, this._player);
		};
	};

	this._started = true;
	return true;
};

// Is there a dynamic object at given coordinates?
Game.Map.prototype.checkForDynamic = function(nx, ny) {
	var x = Math.floor(nx);
	var y = Math.floor(ny);
	for (key in this._dynamics) {
		var curr = this._dynamics[key];
		if (curr.getX() == x && curr.getY() == y) {
			return true;
		};
	};
};

Game.Map.prototype.playerKilled = function(killer) {
	this._display.showNotice("You have been caught by: "+killer+"!</br>Your score is: "+this._player.getScore()+" point.");
	//this.draw(false);
	this._game.stop();
};

// Map turn.
// Move all pieces and do a flip redraw
Game.Map.prototype.act = function() {
	if(this._started === false) {
		if (!this._display._notice) {this._display.showNotice("Start the game by moving.</br>Use arrows to move around.");};
		return;
	};
	if (this._display._notice) {this._display.hideNotice();};
	this._game.checkMap();
	for(key in this._dynamics) {
		this._dirty[this._dynamics[key].getX()][this._dynamics[key].getY()] = true;
		this._dynamics[key].act();
		this._dirty[this._dynamics[key].getX()][this._dynamics[key].getY()] = true;
	};
	//this.draw(true);
};
