/***********************************************************************/
// Player object
// Content of player.js
Game.Player = function (x, y, tile, map, game) {
	this._x = x;
	this._y = y;
	this._game = game;
	this._map = map;
	this.tile = tile;
	this._keyMap = {};
	this._keyMap[37] = "left";
	this._keyMap[38] = "up";
	this._keyMap[39] = "right";
	this._keyMap[40] = "down";
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

Game.Player.prototype.move = function(direction) {

};

Game.Player.prototype.handleEvent = function(e) {
	var code = e.keyCode;

	if (!(code in this._keyMap)) { return; }
	window.removeEventListener("keydown", this);
	switch(code) {
		case 37: this._x--; break;
		case 38: this._y--; break;
		case 39: this._x++; break;
		case 40: this._y++; break;
	}
	this._game.unlock();
}
