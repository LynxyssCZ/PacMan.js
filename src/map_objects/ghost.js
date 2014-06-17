Game.Map.Ghost = function(tile) {
	this.dynamic = true;
	this.impassable = true;
	this.tile = tile;
	this._animation = 0;
	this._brain = [2, 0, 6, 4];
	this._brain.sort(function(a, b) {return Math.random() < 0.5 ;});
	this._dir = this._brain[2];
};

Game.Map.Ghost.prototype.turn = function(me, map){
	if ( me.canMove( this._dir ) ) {
		me.move( this._dir );
	} else {
		this._brain.sort(function(a, b) {return Math.random() < 0.5 ;});
		for (var i = 0; i < this._brain.length; i++) {
			if (me.canMove(this._brain[i])) {
				this._dir = this._brain[i];
				me.move( this._dir );
				return;
			}
		};
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