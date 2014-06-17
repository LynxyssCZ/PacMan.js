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
	this.tile = this._def.tile;
}

Game.DynamicObject.prototype.getTile = function() {
	return this.tile;
}

Game.DynamicObject.prototype.act = function() {
	if (this._def.turn)
		this._def.turn();
};

Game.DynamicObject.prototype.getX = function() {
	return this._x;
};

Game.DynamicObject.prototype.getY = function() {
	return this._y;
};

Game.DynamicObject.prototype.move = function(direction) {
	
};

