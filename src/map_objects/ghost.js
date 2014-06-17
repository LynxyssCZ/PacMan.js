Game.Map.Ghost = function(tile) {
	this.dynamic = true;
	this.impassable = true;
	this.tile = tile;
	this._dir = 0;
	this._animation = 0;
};

Game.Map.Ghost.prototype.turn = function(){

};

Game.Map.Ghost.prototype.Move = function( dir ) {

}

Game.Map.Ghost.prototype.CanMove = function(x, y) {

}

Game.Map.Ghost.prototype.onCollision = function(me, player) {
	player.killedBy("Ghost");
	return true;
}

Game.Map.Ghost.prototype.getFrame = function() {
	return this._dir+this._animation;
};