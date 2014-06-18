Game.Map.Ghost = function(tile, name) {
	this.dynamic = true;
	this.impassable = true;
	this.name = name;
	this.tile = tile;
	this._animation = 0;
	this._brain = [2, 0, 6, 4];
	this._dir = this._brain[0];
};

Game.Map.Ghost.prototype.turn = function(me, map){

	var dirs = [];
	for (var i = 0; i < this._brain.length; i++) {
		if (me.canMove(this._brain[i])) {
			dirs.push(this._brain[i]);
		}
	};
	dirs = this.shuffle(dirs);
	if (dirs.length == 3 ) {
		me.move(dirs[0]);
		this._dir = dirs[0];
	} else if ( dirs.indexOf(this._dir) > -1 ) {
		me.move( this._dir );
	} else if ( dirs.length > 0 ) {
		me.move(dirs[0]);
		this._dir = dirs[0];
	}
};

Game.Map.Ghost.prototype.onCollision = function(me, player) {
	player.killedBy(this.name+" the ghost");
	return true;
}

Game.Map.Ghost.prototype.getFrame = function(flip) {
	var frame = this._animation;
	if(flip){
		if (this._animation == 0) { this._animation++;}
		else {this._animation = 0; }
	}
	return this._dir+frame;
};

Game.Map.Ghost.prototype.shuffle = function(array) {
    var tmp, current, top = array.length;

    if(top) while(--top) {
    	current = Math.floor(Math.random() * (top + 1));
    	tmp = array[current];
    	array[current] = array[top];
    	array[top] = tmp;
    }

    return array;
}