// Global namespace wrapper
var Game = {

};
// Engine object
Game.Engine = function (size, width, height) {
	this.tileSize = size;
	this.width = width;
	this.height = height;
	this._qeue = [];
	this._lock = 1;
};

Game.Engine.prototype.init = function (spriteSheet) {
	this.display = new Game.Display(this.width, this.height, this.tileSize, this.tileSize, spriteSheet);
	this.map = new Game.Map(this, this.display);
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
	return current;
};

// Map object
Game.Map = function (game, display) {
	this._game = game;
	this._display = display;
	this._objectDefs = [];
	this._objects = [[]];
	this._dynamics = [];
	this._playerCoords = null;
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

Game.Map.prototype.placeObject = function (nx, ny, type) {
	var x = Math.floor(nx);
	var y = Math.floor(ny);
	if (!this._objectDefs[type])
		throw "There is no type of object named " + type + "!";

	if (typeof(this._objects[x]) === 'undefined') { // Row not instanced yet
		this._objects[x] = [];
		this._objects[x][y] = type;
	} else if (typeof(this._objects[x][y]) === 'undefined') { // Cell empty
		this._objects[x][y] = type;
	} else { // Cell Is full
		throw "Cell " + x +":"+ y + " is already full!";
	}
};

Game.Map.prototype.placePlayer = function (x, y, tile) {
	if (this._playerCoords === null) this._playerCoords = [x, y];
	else throw "Player already in place!";
	
};

Game.Map.prototype.draw = function() {
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
}

// Display object
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

// Player Object
Game.Player = function (tile) {
	this.tile = tile;
};
