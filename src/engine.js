/***********************************************************************/
// Engine object
// Content of engine.js
Game.Engine = function (size, width, height, container) {
	this.tileSize = size;
	this.width = width;
	this.height = height;
	this._qeue = [];
	this._levels = [];
	this._level = 0;
	this._lock = 1;
	this._running = false;
	this.display;
	this.map;
	this._refresher;
	this._framecounter = 0;
	this._container = container
};

Game.Engine.prototype.init = function (levels, spriteSheet) {
	this._levels = levels;
	this.display = new Game.Display(this.width, this.height, this.tileSize, this.tileSize, spriteSheet);
	this.map = new Game.Map(this, this.display, this.width, this.height);
	this._container.appendChild(this.display.getContainer());

};

Game.Engine.prototype.loadLevel = function (index) {
	this.map.clear();
	if (index >= this._levels.length) {
		return false;
	};
	// Hand level the map reference.
	this._levels[index].load(this.map);
	return true;
};

Game.Engine.prototype.start = function () {
	if(this.loadLevel(this._level))
	{
		this.add(this.map);
		this.add(new Game.Engine.Timer(150, this));
		this._level++;
		this._refresher = window.setInterval(this.refresh.bind(this), (1000/30) );
		window.addEventListener("keydown", this.map._player);
		this._running = true;
		this.unlock();
	}
};

Game.Engine.prototype.stop = function () {
	this.lock();
	window.removeEventListener("keydown", this.map._player);
	window.clearInterval(this._refresher);
	this.clear();
	this._running = false;
};

Game.Engine.prototype.checkMap = function () {
	if (! this._running ) { return; };
	if ( this._levels[this._level-1].checkVictory(this.map) ) {
		this.display.showNotice("All cakes on map have been nomed!</br>You ended up with score of: "+this.map.getPlayer().getScore()+" points.");
		this.stop();
	};
};

Game.Engine.prototype.refresh = function() {
	if ( this._framecounter == 6 ) { this._framecounter = 0; };
	this.map.draw( this._framecounter == 0 );
	this._framecounter++;
};

////////////////////
// Scheduler code //
////////////////////
Game.Engine.prototype.lock = function () {
	this._lock++;
	return this;
};

Game.Engine.prototype.unlock = function () {
	this._lock--;
	while (!this._lock) {
		var actor = this._next();
		if (!actor) {
			return this.lock();
		}
		var result = actor.act();
		if (result && result.then) { // Returned thenable function, Promise
			this.lock(); // Lock for now
			result.then(this.unlock.bind(this)); // And bind promise for unlocking
		}
	}
	return this;
};

Game.Engine.prototype.add = function(actor) {
	if(!actor.act) throw "Not a valid actor";
	this._qeue.push(actor);
}

Game.Engine.prototype._next = function() {
	var current = this._qeue.pop();
	this._qeue.unshift(current);
	return current;
};

Game.Engine.prototype.clear = function() {
	this._qeue = [];
}

