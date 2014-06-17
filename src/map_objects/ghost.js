Game.Map.Ghost = function(tile) {
	this.dynamic = true;
	this.impassable = true;
	this.tile = tile;
	this._dir = 0;
	this._animation = 0;
};

Game.Map.Ghost.prototype.turn = function(me, map){
	if ( me.canMove( this._dir ) ) {
		me.move( this._dir );
	} else {
		do {
			this._dir = Math.floor(Math.random()*4)*2;
		} while( !me.canMove(this._dir) );
		me.move( this._dir );
	}
};

Game.Map.Ghost.prototype.onCollision = function(me, player) {
	player.killedBy("Ghost");
	return true;
}

Game.Map.Ghost.prototype.getFrame = function() {
	var frame = this._animation;
	if (this._animation == 0) { this._animation++;}
	else {this._animation = 0; }
	return this._dir+frame;
};