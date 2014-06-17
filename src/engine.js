/***********************************************************************/
// Engine object
// Content of engine.js
Game.Engine = function (size, width, height) {
	this.tileSize = size;
	this.width = width;
	this.height = height;
	this._qeue = [];
	this._lock = 1;
};

Game.Engine.prototype.init = function (spriteSheet) {
	this.display = new Game.Display(this.width, this.height, this.tileSize, this.tileSize, spriteSheet);
	this.map = new Game.Map(this, this.display);
	this.add(this.map);
	document.body.appendChild(this.display.getContainer());
	
};

Game.Engine.prototype.loadLevel = function (level) {
	this.map.clear();
	// Hand level the map reference.
	level.load(this.map);
};

Game.Engine.prototype.start = function () {
	this.unlock();
};

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

