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
		if (this._dynamics[key].tile) {
			var curr = this._dynamics[key];
			this._display.drawTile( curr.getX(), curr.getY(), curr.getTile(), curr.getFrame(), false );
		};
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

Game.Map.prototype.checkDynamicCollision = function() {

}

Game.Map.prototype.act = function() {
	for(key in this._dynamics) {

	}
	this.draw();
};
