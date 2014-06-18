/***********************************************************************/
// Global namespace wrapper
// Content of game.js
var Game = {

};
/***********************************************************************/
// Display object
// Content of display.js
Game.Display = function (width, height, tileWidth, tileHeight, sheet) {
	this.width = width;
	this.height = height;
	this.tileWidth = tileWidth;
	this.tileHeight = tileHeight;
	this.sheet = sheet;
	var canvas = document.createElement("canvas");
	this._context = canvas.getContext("2d");
	this._context.canvas.width = this.width * this.tileWidth;
	this._context.canvas.height = this.height * this.tileHeight;
	this.clear();
	this._context.textAlign="center";
};

Game.Display.prototype.getContainer = function () {
	return this._context.canvas;
};

Game.Display.prototype.drawTile = function (x, y, tile, frame, clear) {
	if (clear) this.clearTile(x, y);
	this._context.drawImage(this.sheet, (frame * this.tileWidth), (tile * this.tileHeight), this.tileWidth, this.tileHeight, (x * this.tileWidth), (y * this.tileHeight), this.tileWidth, this.tileHeight);
};

Game.Display.prototype.drawText = function(x, y, size, text) {
	this._context.font = this.tileWidth*size+"px Verdana";
	this._context.fillStyle = '#000000';
	var width = Math.ceil((this._context.measureText(text).width)/this.tileWidth);
	this.drawBlock(x-(width/2), y-size, width, 1, "#000000");
	this._context.fillStyle = '#FFFFFF';
	this._context.fillText(text, this.tileWidth*x, this.tileHeight*y);
}

Game.Display.prototype.drawBlock = function (x, y, w, h, color) {
	this._context.fillStyle = color;
	this._context.fillRect((x * this.tileWidth), (y * this.tileHeight), (w * this.tileWidth), (h * this.tileHeight));
};

Game.Display.prototype.clear = function () {
	this._context.fillStyle = '#000000';
	this._context.fillRect(0, 0, this.width * this.tileWidth, this.height * this.tileHeight);
};

Game.Display.prototype.clearTile = function (x, y) {
	this.drawBlock(x, y, 1, 1, "#000000");
};
/***********************************************************************/
// Engine object
// Content of engine.js
Game.Engine = function (size, width, height) {
	this.tileSize = size;
	this.width = width;
	this.height = height;
	this._qeue = [];
	this._lock = 1;
};

Game.Engine.prototype.init = function (spriteSheet) {
	this.display = new Game.Display(this.width, this.height, this.tileSize, this.tileSize, spriteSheet);
	this.map = new Game.Map(this, this.display, this.width, this.height);
	this.add(this.map);
	this.add(new Game.Engine.Timer(150, this));
	document.body.appendChild(this.display.getContainer());
};

Game.Engine.prototype.loadLevel = function (level) {
	this.map.clear();
	// Hand level the map reference.
	level.load(this.map);
};

Game.Engine.prototype.start = function () {
	window.addEventListener("keydown", this.map._player);
	this.unlock();
};

Game.Engine.prototype.lock = function () {
	this._lock++;
	return this;
};

Game.Engine.prototype.unlock = function () {
	this._lock--;
	while (!this._lock) {
		var actor = this._next();
		if (!actor) {
			return this.lock();
		}
		var result = actor.act();
		if (result && result.then) { // Returned thenable function, Promise
			this.lock(); // Lock for now
			result.then(this.unlock.bind(this)); // And bind promise for unlocking
		}
	}
	return this;
};

Game.Engine.prototype.add = function(actor) {
	if(!actor.act) throw "Not a valid actor";
	this._qeue.push(actor);
}

Game.Engine.prototype._next = function() {
	var current = this._qeue.pop();
	this._qeue.unshift(current);
	return current;
};

Game.Engine.prototype.clear = function() {
	this._qeue = [];
}

/***********************************************************************/
// Map object
// Content of map.js
Game.Map = function (game, display, width, height) {
	this._game = game;
	this._display = display;
	this._width = width;
	this._height = height;
	this.clear();
};

Game.Map.prototype.clear = function() {
	this._objectDefs = [];
	this._objects = [[]];
	this._dirty = [[]];
	this._dynamics = [];
	this._player = null;
	this._foodCount = 0;
}

Game.Map.prototype.scoreBoard = function (x, y, size) {
	this._scoreX = x;
	this._scoreY = y;
	this._scoreSize = size;
}

/**
 * Add object definition
 */
Game.Map.prototype.defineObject = function (name, props) {
	if (this._objectDefs[name]) {
		throw "There is already a type of object named " + name + "!";
	}
	this._objectDefs[name] = props;
};

Game.Map.prototype.setFoodCount = function(count) {
	this._foodCount = count;
}

Game.Map.prototype.getFoodCount = function() {
	return this._foodCount;
}

Game.Map.prototype.eatFood = function(nx, ny) {
	var x = Math.floor(nx);
	var y = Math.floor(ny);
	this.destroyObject(x, y);
	this._foodCount--;
}

Game.Map.prototype.addDynamic = function(nx, ny, type) {
	var x = Math.floor(nx);
	var y = Math.floor(ny);
	if (!this._objectDefs[type])
		throw "There is no type of object named " + type + "!";
	var actor = new Game.DynamicObject(type, x, y, this._game, this);
	this._dynamics.push( actor );
}

Game.Map.prototype.placeObject = function (nx, ny, type) {
	var x = Math.floor(nx);
	var y = Math.floor(ny);
	if (!this._objectDefs[type])
		throw "There is no type of object named " + type + "!";
	if ( x == this.getPlayerX() && y == this.getPlayerY() ) throw "Cell occupied by a player!";
	if (typeof(this._objects[x]) === 'undefined') { // Row not instanced yet
		this._objects[x] = [];
		this._dirty[x] = [];
		this._objects[x][y] = type;
		this._dirty[x][y] = true;
		if (type == 'food') {this._foodCount++;};
	} else if (typeof(this._objects[x][y]) === 'undefined') { // Cell empty
		this._objects[x][y] = type;
		this._dirty[x][y] = true;
		if (type == 'food') {this._foodCount++;};
	} else { // Cell Is full
		throw "Cell " + x +":"+ y + " is already full!";
	}
};

Game.Map.prototype.destroyObject = function(nx, ny) {
	var x = Math.floor(nx);
	var y = Math.floor(ny);

	if (typeof(this._objects[x]) !== 'undefined') { // Row is instanced
		if (typeof(this._objects[x][y]) !== 'undefined') { // Cell is not empty
			delete this._objects[x][y];
			this._dirty[x][y] = true;
			return true;
		}
	}
	return false;
}

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

Game.Map.prototype.getPlayer = function() {
	if (this._player) {return this._player;}
}

Game.Map.prototype.getPlayerX = function() {
	if (this._player) { return this._player.getX(); };
}

Game.Map.prototype.getPlayerY = function() {
	if (this._player) { return this._player.getY(); };
}

Game.Map.prototype.getDefinition = function(type) {
	return this._objectDefs[type];
}

// Redraw the whole map
Game.Map.prototype.draw = function() {
	//this._display.clear();
/**
	for (var row in this._objects) {
		for (var coll in this._objects[row]) {
			var objectDef = this._objectDefs[this._objects[row][coll]];
			if ( objectDef.tile ) {
				if ( objectDef.frame ) {
					this._display.drawTile( row, coll, objectDef.tile, objectDef.frame, false );
				} else {
					this._display.drawTile( row, coll, objectDef.tile, 0, false );
				}
			}
			else if( objectDef.color ) {
				this._display.drawBlock( row , coll , 1, 1, objectDef.color);
			}
		};
	};
	*/
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
	for (key in this._dynamics) {
		var curr = this._dynamics[key];
		this._display.drawTile( curr.getX(), curr.getY(), curr.getTile(), curr.getFrame(), true );
	};
	if (this._player) {this._display.drawTile( this._player.getX(), this._player.getY(), this._player.getTile(), this._player.getFrame(), true );};
	if (this._scoreSize) {
		this._display.drawText(this._scoreX, this._scoreY, this._scoreSize, "Score:");
		this._display.drawText(this._scoreX, this._scoreY+this._scoreSize, this._scoreSize, this._player.getScore());
	};
}

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
}

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
}

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
	if (typeof(this._objects[x]) !== 'undefined') { // Row is instanced
		if (typeof(this._objects[x][y]) !== 'undefined') { // Cell is not empty
			if ( this._objectDefs[this._objects[x][y]].onCollision ) {
				this._objectDefs[this._objects[x][y]].onCollision({x:x, y:y}, this._player);
			};
		}
	}
	return true;
}

Game.Map.prototype.checkForDynamic = function(nx, ny) {
	var x = Math.floor(nx);
	var y = Math.floor(ny);
	for (key in this._dynamics) {
		var curr = this._dynamics[key];
		if (curr.getX() == x && curr.getY() == y) {
			return true;
		};
	};
}

Game.Map.prototype.act = function() {
	if (this.getFoodCount() == 0) {
		this.draw();
		this._game.lock();
		alert("All has been nomed!");
		return;
	};
	if (this._player.killed) {
		this.draw();
		this._game.lock();
		return;
	};
	for(key in this._dynamics) {
		this._dirty[this._dynamics[key].getX()][this._dynamics[key].getY()] = true;
		this._dynamics[key].act();
		this._dirty[this._dynamics[key].getX()][this._dynamics[key].getY()] = true;
	}
	if (this._player.killed) {
		this._game.lock();
	};

	this.draw();
};
Game.Engine.Timer = function (time, game) {
	this._game = game;
	this._time = time;
};

Game.Engine.Timer.prototype.act = function() {
	this._game.lock();
	var seconds = new Date().getTime() / 1000;
	window.setTimeout(this.timeout.bind(this), this._time);
};

Game.Engine.Timer.prototype.timeout = function() {
	this._game.unlock();
};Game.Level01 = {
	load: function(map) {
		map.defineObject("block", Game.Map.Wall);
		map.defineObject("blinky", new Game.Map.Ghost(1));
		map.defineObject("pinky", new Game.Map.Ghost(2));
		map.defineObject("inky", new Game.Map.Ghost(3));
		map.defineObject("clyde", new Game.Map.Ghost(4));
		map.defineObject("food", Game.Map.Food );
		map.scoreBoard(21,13,1);
		Game.Level01.buildMaze(map, this.Walls);

	},

	buildMaze: function(map, Walls) {
		for (var y = 0; y < Walls.length; y++) {
			for (var x = 0; x < Walls[y].length; x++) {
				switch( Walls[y][x] ) {
					case 'W': map.placeObject(x, y, 'block');
						break;
					case '*': map.placeObject(x, y, 'food');
						break;
					case 'P': map.addDynamic(x, y, "pinky");
						break;
					case 'B': map.addDynamic(x, y, "blinky");
						break;
					case 'I' : map.addDynamic(x, y, "inky");
						break;
					case 'C' : map.addDynamic(x, y, "clyde");
						break;
					case 'O' : map.placePlayer(x, y, 0);
						break;
				}
			};
		};
	},

	Walls: [
		'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
		'WWW***********************************____***********************************WWW',
		'WWW*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW__O_WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*WWW',
		'W*************************************____*************************************W',
		'W*W*WWWWWWWWWWWWWWWWW_WWWWWWWWWWWWWWWW_WW_WWWWWWWWWWWWWWWW_WWWWWWWWWWWWWWWWW*W*W',
		'W*W*WW*******************************W_WW_W*******************************WW*W*W',
		'W*W*WW*WWWWWWWWWWWWWWWWWWWWWWWWWWWWW*W_WW_W*WWWWWWWWWWWWWWWWWWWWWWWWWWWWW*WW*W*W',
		'W*W*WW*WW*************************WW*W_WW_W*WW*************************WW*WW*W*W',
		'W*W*WW*WW*WWWWWWWWWWWWWWWWWWWWWWW*WW*W_WW_W*WW*WWWWWWWWWWWWWWWWWWWWWWW*WW*WW*W*W',
		'W*W*WW*WW*WWWWWWWWWWWWWWWWWWWWWWW*WW*W_WW_W*WW*WWWWWWWWWWWWWWWWWWWWWWW*WW*WW*W*W',
		'W*W*WW*WW*WW___________________WW*WW*W_WW_W*WW*WWWWWWWWWWWWWWWWWWWWWWW*WW*WW*W*W',
		'W*W*WW*WW*WW___________________WW*WW*W_WW_W*WW*WWWWWWWWWWWWWWWWWWWWWWW*WW*WW*W*W',
		'W*W*WW*WW*WW___________________WW*WW*W_WW_W*WW*WWWWWWWWWWWWWWWWWWWWWWW*WW*WW*W*W',
		'W*W*WW*WW*WW___________________WW*WW*W****W*WW*WWWWWWWWWWWWWWWWWWWWWWW*WW*WW*W*W',
		'W*W*WW*__*WW___________________WW*WW*WWWWWW*WW*WWWWWWWWWWWWWWWWWWWWWWW*__*WW*W*W',
		'W*W*WW*WW*WW___________________WW*WW********WW*WWWWWWWWWWWWWWWWWWWWWWW*WW*WW*W*W',
		'W*W*WW*WW*WWWWWWWWWWWWWWWWWWWWWWW*WWWW_WW_WWWW*WWWWWWWWWWWWWWWWWWWWWWW*WW*WW*W*W',
		'W*W*WW*WW*WWWWWWWWWWWWWWWWWWWWWWW*WWWW_WW_WWWW*WWWWWWWWWWWWWWWWWWWWWWW*WW*WW*W*W',
		'W*W*WW*WW**************************************************************WW*WW*W*W',
		'W*W*__*WWWWW_WWWWWWWWWWWWWWWWWWWWWWWWW_PI_WWWWWWWWWWWWWWWWWWWWWWWWW_WWWWW*__*W*W',
		'W*W*WW*WWWWW_WWWWWWWWWWWWWWWWWWWWWWWWW_CB_WWWWWWWWWWWWWWWWWWWWWWWWW_WWWWW*WW*W*W',
		'W*W*WW*WW**************************************************************WW*WW*W*W',
		'W*W*WW*WW*WWWWWWWWWWWWWWWWWWWWWWW*WWWW_WW_WWWW*WWWWWWWWWWWWWWWWWWWWWWW*WW*WW*W*W',
		'W*W*WW*WW*WWWWWWWWWWWWWWWWWWWWWWW*WWWW_WW_WWWW*WWWWWWWWWWWWWWWWWWWWWWW*WW*WW*W*W',
		'W*W*WW*WW*WWWWWWWWWWWWWWWWWWWWWWW*WW********WW*WWWWWWWWWWWWWWWWWWWWWWW*WW*WW*W*W',
		'W*W*WW*__*WWWWWWWWWWWWWWWWWWWWWWW*WW*WWWWWW*WW*WWWWWWWWWWWWWWWWWWWWWWW*__*WW*W*W',
		'W*W*WW*WW*WWWWWWWWWWWWWWWWWWWWWWW*WW*W****W*WW*WWWWWWWWWWWWWWWWWWWWWWW*WW*WW*W*W',
		'W*W*WW*WW*WWWWWWWWWWWWWWWWWWWWWWW*WW*W*WW*W*WW*WWWWWWWWWWWWWWWWWWWWWWW*WW*WW*W*W',
		'W*W*WW*WW*WWWWWWWWWWWWWWWWWWWWWWW*WW*W*WW*W*WW*WWWWWWWWWWWWWWWWWWWWWWW*WW*WW*W*W',
		'W*W*WW*WW*WWWWWWWWWWWWWWWWWWWWWWW*WW*W*WW*W*WW*WWWWWWWWWWWWWWWWWWWWWWW*WW*WW*W*W',
		'W*W*WW*WW*WWWWWWWWWWWWWWWWWWWWWWW*WW*W*WW*W*WW*WWWWWWWWWWWWWWWWWWWWWWW*WW*WW*W*W',
		'W*W*WW*WW*WWWWWWWWWWWWWWWWWWWWWWW*WW*W*WW*W*WW*WWWWWWWWWWWWWWWWWWWWWWW*WW*WW*W*W',
		'W*W*WW*WW*************************WW*W*WW*W*WW*************************WW*WW*W*W',
		'W*W*WW*WWWWWWWWWWWWWWWWWWWWWWWWWWWWW*W*WW*W*WWWWWWWWWWWWWWWWWWWWWWWWWWWWW*WW*W*W',
		'W*W*WW*******************************W*WW*W*******************************WW*W*W',
		'W*W*WWWWWWWWWWWWWWWWW_WWWWWWWWWWWWWWWW*WW*WWWWWWWWWWWWWWWW_WWWWWWWWWWWWWWWWW*W*W',
		'W**************************************WW**************************************W',
		'WWW*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW****WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*WWW',
		'WWW************************************WW************************************WWW',
		'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW'
	]
}/***********************************************************************/
// Dynamic object
// Content of dynamic.js
Game.DynamicObject = function (type, x, y, game, map) {
	this._game = game;
	this._map = map;
	this._type = type;
	this._x = x;
	this._y = y;
	this._def = map.getDefinition(type);
}

Game.DynamicObject.prototype.getTile = function() {
	if (this._def.getTile) { return this._def.getTile(); }
	else return this._def.tile;
}

Game.DynamicObject.prototype.getFrame = function() {
	if ( this._def.getFrame ) { return this._def.getFrame() };
	return 0;
}

Game.DynamicObject.prototype.act = function() {
	if (this._def.turn)
		this._def.turn(this, this._map);
};

Game.DynamicObject.prototype.getX = function() {
	return this._x;
};

Game.DynamicObject.prototype.getY = function() {
	return this._y;
};

Game.DynamicObject.prototype.canMove = function( direction ) {
	switch(direction) {
		case 2: return this._map.canMoveTo( this._x-1, this._y ) && !this._map.checkForDynamic( this._x-1, this._y );
			break;
		case 0: return this._map.canMoveTo( this._x+1, this._y ) && !this._map.checkForDynamic( this._x+1, this._y );
			break;
		case 4: return this._map.canMoveTo( this._x, this._y-1 ) && !this._map.checkForDynamic( this._x, this._y-1 );
			break;
		case 6: return this._map.canMoveTo( this._x, this._y+1 ) && !this._map.checkForDynamic( this._x, this._y+1 );
			break;
	}
}

Game.DynamicObject.prototype.move = function(direction) {
	var newX = this._x; var newY = this._y;
	switch(direction) {
		case 2: newX--;
			break;
		case 0: newX++;
			break;
		case 4: newY--;
			break;
		case 6: newY++;
			break;
	}

	// Check if player is on new indices
	if ( this._map.getPlayerX() == newX && this._map.getPlayerY() == newY ) {
		this.onCollision(this._map.getPlayer());
	} else {
		this._x = newX;
		this._y = newY;
	}
};

Game.DynamicObject.prototype.onCollision = function(player) {
	if (this._def.onCollision) {
		return this._def.onCollision(this, player);
	} else {
		return true;
	}
}
Game.Map.Food = {
	tile: 5,
	frame: 1,
	value: 10,
	onCollision: function(me, player) {
		me.value = this.value;
		player.nom(me);
		return true;
	}
};Game.Map.Ghost = function(tile) {
	this.dynamic = true;
	this.impassable = true;
	this.tile = tile;
	this._animation = 0;
	this._brain = [2, 0, 6, 4];
	this._dir = this._brain[0];
};

Game.Map.Ghost.prototype.turn = function(me, map){

	var dirs = [];
	for (var i = 0; i < this._brain.length; i++) {
		if (me.canMove(this._brain[i])) {
			dirs.push(this._brain[i]);
		}
	};
	dirs = this.shuffle(dirs);
	if (dirs.length == 3 ) {
		me.move(dirs[0]);
		this._dir = dirs[0];
	} else if ( dirs.indexOf(this._dir) > -1 ) {
		me.move( this._dir );
	} else if ( dirs.length > 0 ) {
		me.move(dirs[0]);
		this._dir = dirs[0];
	}
};

Game.Map.Ghost.prototype.onCollision = function(me, player) {
	player.killedBy("Ghost");
	return true;
}

Game.Map.Ghost.prototype.getFrame = function() {
	var frame = this._animation;
	if (this._animation == 0) { this._animation++;}
	else {this._animation = 0; }
	return this._dir+frame;
};

Game.Map.Ghost.prototype.shuffle = function(array) {
    var tmp, current, top = array.length;

    if(top) while(--top) {
    	current = Math.floor(Math.random() * (top + 1));
    	tmp = array[current];
    	array[current] = array[top];
    	array[top] = tmp;
    }

    return array;
}/***********************************************************************/
// Player object
// Content of player.js
Game.Player = function (x, y, tile, map, game) {
	this._x = x;
	this._y = y;
	this.killed = false;
	this._game = game;
	this._map = map;
	this._score = 0;
	this.tile = tile;
	this._dir = 0;
	this._animation = 0;
	this._keyMap = {};
	this._keyMap[37] = 2; // LEFT
	this._keyMap[38] = 4; // UP
	this._keyMap[39] = 0; // RIGHT
	this._keyMap[40] = 6; // DOWN
	this._myTurn = false;
};

Game.Player.prototype.act = function() {
	this._myTurn = true;
};

Game.Player.prototype.killedBy = function(killer) {
	//this._game.lock();
	this.killed = true;
	alert("Killed by "+killer+"\nScore achieved: "+this._score);
};

Game.Player.prototype.nom = function ( food ) {
	this._score+=food.value;
	this._map.eatFood(food.x, food.y);
};

Game.Player.prototype.getScore = function() {
	return this._score;
}

Game.Player.prototype.getY = function() {
	return this._y
};

Game.Player.prototype.getX = function() {
	return this._x
};

Game.Player.prototype.getTile = function() {
	return this.tile;
};

Game.Player.prototype.getFrame = function() {
	var frame = this._animation;
	if (this._animation == 0) { this._animation++;}
	else {this._animation = 0; }
	return this._dir+frame;
};

Game.Player.prototype.move = function(newX, newY) {

	if (!this._map.canMoveTo(newX, newY, 'player')) { return false; };
	if (this._map.playerMoveTo(newX, newY)) {
		this._x = newX;
		this._y = newY;
		return true;
	}

	return false;
};

Game.Player.prototype.handleEvent = function(e) {
	var code = e.keyCode;
	if(!this._myTurn) { return; }
	if (!(code in this._keyMap)) { return; }
	var newX = this._x;
	var newY = this._y;
	switch(code) {
		case 37: newX--; break;
		case 38: newY--; break;
		case 39: newX++; break;
		case 40: newY++; break;
	}

	if (this.move(newX, newY)) {
		this._dir = this._keyMap[code] ;
		this._map.draw();
		this._myTurn = false;
	};
};
Game.Map.Wall = {
	impassable:true ,
//	tile: 5,
//	frame: 0,
	color: "#666666"
};
