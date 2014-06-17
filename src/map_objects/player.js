/***********************************************************************/
// Player object
// Content of player.js
Game.Player = function (x, y, tile, map, game) {
	this._x = x;
	this._y = y;
	this._game = game;
	this._map = map;
	this.tile = tile;
	this._dir = 0;
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
	return this._dir;
}

Game.Player.prototype.move = function(direction) {

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

	if (!this._map.canMoveTo(newX, newY, 'player')) { return; };
	this._map.playerMoveTo(newX, newY);
	
	this._x = newX;
	this._y = newY;
	this._dir = this._keyMap[code] ;
	
	window.removeEventListener("keydown", this);
	this._game.unlock();
}
