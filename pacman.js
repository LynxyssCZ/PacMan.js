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
};

Game.Display.prototype.getContainer = function () {
	return this._context.canvas;
};

Game.Display.prototype.drawTile = function (x, y, tile, frame, clear) {
	if (clear) this.clearTile(x, y);
	this._context.drawImage(this.sheet, (frame * this.tileWidth), (tile * this.tileHeight), this.tileWidth, this.tileHeight, (x * this.tileWidth), (y * this.tileHeight), this.tileWidth, this.tileHeight);
};

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
	document.body.appendChild(this.display.getContainer());
	
};

Game.Engine.prototype.loadLevel = function (level) {
	this.map.clear();
	// Hand level the map reference.
	level.load(this.map);
};

Game.Engine.prototype.start = function () {
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
	this._objectDefs = [];
	this._objects = [[]];
	this._dynamics = [];
	this._player = null;
	this._width = width;
	this._height = height;
};

/**
 * Add object definition
 */
Game.Map.prototype.defineObject = function (name, props) {
	if (this._objectDefs[name]) {
		throw "There is already a type of object named " + name + "!";
	}
	this._objectDefs[name] = props;
};

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
		this._objects[x][y] = type;
	} else if (typeof(this._objects[x][y]) === 'undefined') { // Cell empty
		this._objects[x][y] = type;
	} else { // Cell Is full
		throw "Cell " + x +":"+ y + " is already full!";
	}
};

Game.Map.prototype.destroyObject = function(nx, ny) {
	var x = Math.floor(nx);
	var y = Math.floor(ny);

	if (typeof(this._objects[x]) !== 'undefined') { // Row is instanced
		if (typeof(this._objects[x][y]) !== 'undefined') { // Cell is not empty
			this._objects[x].splice(y, 1);
		}
	}
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
	if (this._player) { return this._player._x; };
}

Game.Map.prototype.getPlayerY = function() {
	if (this._player) { return this._player._y; };
}

Game.Map.prototype.getDefinition = function(type) {
	return this._objectDefs[type];
}

// Redraw the whole map
Game.Map.prototype.draw = function() {
	this._display.clear();
	for (var row in this._objects) {
		for (var coll in this._objects[row]) {
			var objectDef = this._objectDefs[this._objects[row][coll]];
			if ( objectDef.tile ) { 
			}
			else if( objectDef.color ) { 
				this._display.drawBlock( row , coll , 1, 1, objectDef.color);
			}
		};
	};
	for (key in this._dynamics) {
		var curr = this._dynamics[key];
		this._display.drawTile( curr.getX(), curr.getY(), curr.getTile(), curr.getFrame(), false );
	};
	if (this._player) {this._display.drawTile( this._player.getX(), this._player.getY(), this._player.getTile(), this._player.getFrame(), true );};
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
	for(key in this._dynamics) {
		this._dynamics[key].act();
	}
	this.draw();
};
/***********************************************************************/
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
		case 0: return this._map.canMoveTo( this._x-1, this._y ) && !this._map.checkForDynamic( this._x-1, this._y );
			break;
		case 2: return this._map.canMoveTo( this._x+1, this._y ) && !this._map.checkForDynamic( this._x+1, this._y );
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
		case 0: newX--;
			break;
		case 2: newX++;
			break;
		case 4: newY--;
			break;
		case 6: newY++;
			break;
	}

	// Check if player is on new indices
	if ( this._map.GetPlayerX == newX && this._map.GetPlayerX == newX ) {
		this.onCollision(this._map.getPlayer);
	}
	this._x = newX;
	this._y = newY;
};

Game.DynamicObject.prototype.onCollision = function(player) {
	if (this._def.onCollision) {
		return this._def.onCollision(this, player);
	} else {
		return true;
	}
}
Game.Map.Food = {
	color:"#0f0",
	onCollision: function(me, player) {
		player.nom(me);
	}
};Game.Map.Ghost = function(tile) {
	this.dynamic = true;
	this.impassable = true;
	this.tile = tile;
	this._dir = 0;
	this._animation = 0;
};

Game.Map.Ghost.prototype.turn = function(me, map){
	if ( me.canMove( this._dir ) ) {
		me.move( this._dir );
	} else {
		do {
			this._dir = Math.floor(Math.random()*4)*2;
		} while( !me.canMove(this._dir) );
		me.move( this._dir );
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
};/***********************************************************************/
// Player object
// Content of player.js
Game.Player = function (x, y, tile, map, game) {
	this._x = x;
	this._y = y;
	this._game = game;
	this._map = map;
	this.tile = tile;
	this._dir = 0;
	this._animation = 0;
	this._keyMap = {};
	this._keyMap[37] = 2; // LEFT
	this._keyMap[38] = 4; // UP
	this._keyMap[39] = 0; // RIGHT
	this._keyMap[40] = 6; // DOWN
};

Game.Player.prototype.act = function() {
	window.addEventListener("keydown", this);
	this._game.lock();
};

Game.Player.prototype.killedBy = function(killer) {
	this._game.lock();
	alert("Killed by "+killer);
}

Game.Player.prototype.nom = function ( food ) {
	alert("Nom nom at "+food.x+":"+food.y);
	this._map.destroyObject(food.x, food.y);
}

Game.Player.prototype.getY = function() {
	return this._y
};

Game.Player.prototype.getX = function() {
	return this._x
};

Game.Player.prototype.getTile = function() {
	return this.tile;
}

Game.Player.prototype.getFrame = function() {
	var frame = this._animation;
	if (this._animation == 0) { this._animation++;}
	else {this._animation = 0; }
	return this._dir+frame;
}

Game.Player.prototype.move = function(newX, newY) {

	if (!this._map.canMoveTo(newX, newY, 'player')) { return false; };
	if (this._map.playerMoveTo(newX, newY)){
		this._x = newX;
		this._y = newY;
		return true;
	}
	return false;
};

Game.Player.prototype.handleEvent = function(e) {
	var code = e.keyCode;

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
		window.removeEventListener("keydown", this);
		this._game.unlock();
	};

}
Game.Map.Wall = {
	impassable:true ,
	color: "#aaaaaa"
};
