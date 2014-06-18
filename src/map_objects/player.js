/***********************************************************************/
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

Game.Player.prototype.getFrame = function(flip) {
	var frame = this._animation;
	if(flip){
		if (this._animation == 0) { this._animation++;}
		else {this._animation = 0; }
	}
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
		this._map.draw(false); // Non flip call
		this._myTurn = false;
	};
};
