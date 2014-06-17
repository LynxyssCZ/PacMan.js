Game.Map.Ghost = function(tile) {
	this.dynamic = true;
	this.tile = tile;
	this._dir = 0;
	this._animation = 0;
}
Game.Map.Ghost.prototype.turn = function(){

}

Game.Map.Ghost.prototype.getFrame = function() {
	return this._dir+this._animation;
};