/***********************************************************************/
// Display object
// Content of display.js
Game.Display = function (width, height, tileWidth, tileHeight, sheet) {
	this.width = width;
	this.height = height;
	this.tileWidth = tileWidth;
	this.tileHeight = tileHeight;
	this.sheet = sheet;

	// Create canvas
	var canvas = document.createElement("canvas");
	this._context = canvas.getContext("2d");
	this._context.canvas.width = this.width * this.tileWidth;
	this._context.canvas.height = this.height * this.tileHeight;
	this._context.textAlign="center";

	// Create noticeboard and position it
	this._noticeBoard = document.createElement("div");
	this._noticeBoard.setAttribute("id", "game-area-notice");
	this._noticeBoard.setAttribute("style", "width: "+this.width * this.tileWidth+"px; top: "+(this.height * this.tileHeight)/4+"px;");

	this.clear();
	this.hideNotice();
};

Game.Display.prototype.getContainer = function () {
	var frag = document.createDocumentFragment();
	frag.appendChild(this._context.canvas);
	frag.appendChild(this._noticeBoard);
	return frag;
};

Game.Display.prototype.drawTile = function (x, y, tile, frame, clear) {
	if (clear) this.clearTile(x, y);
	this._context.drawImage(this.sheet, (frame * this.tileWidth), (tile * this.tileHeight), this.tileWidth, this.tileHeight, (x * this.tileWidth), (y * this.tileHeight), this.tileWidth, this.tileHeight);
};

Game.Display.prototype.drawText = function(x, y, size, text) {
	this._context.font = this.tileWidth*size+"px Verdana";
	this._context.fillStyle = '#000000';
	var width = Math.ceil((this._context.measureText(text).width)/this.tileWidth);
	this.drawBlock(x-(width/2), y-size, width, 1, "#000000");
	this._context.fillStyle = '#FFFFFF';
	this._context.fillText(text, this.tileWidth*x, this.tileHeight*y);
}

Game.Display.prototype.drawBlock = function (x, y, w, h, color) {
	this._context.fillStyle = color;
	this._context.fillRect((x * this.tileWidth), (y * this.tileHeight), (w * this.tileWidth), (h * this.tileHeight));
};

Game.Display.prototype.clear = function () {
	this._context.fillStyle = '#000000';
	this._context.fillRect(0, 0, this.width * this.tileWidth, this.height * this.tileHeight);
};

Game.Display.prototype.clearTile = function (x, y) {
	this.drawBlock(x, y, 1, 1, "#000000");
};

Game.Display.prototype.showNotice = function( text ) {
	this._notice = true;
	this._noticeBoard.innerHTML = text;
	this._noticeBoard.style.visibility = "visible";
}

Game.Display.prototype.hideNotice = function() {
	this._notice = false;
	this._noticeBoard.innerHTML = "";
	this._noticeBoard.style.visibility = "hidden";
}
