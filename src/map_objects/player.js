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
