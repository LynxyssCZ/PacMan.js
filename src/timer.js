Game.Engine.Timer = function (time, game) {
	this._game = game;
	this._time = time;
};

Game.Engine.Timer.prototype.act = function() {
	this._game.lock();
	var seconds = new Date().getTime() / 1000;
	window.setTimeout(this.timeout.bind(this), this._time);
};

Game.Engine.Timer.prototype.timeout = function() {
	this._game.unlock();
};