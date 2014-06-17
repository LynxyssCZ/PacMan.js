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
