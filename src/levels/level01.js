Game.Level01 = {
	load: function(map) {
		map.defineObject("block", Game.Map.Wall);
		map.defineObject("blinky", new Game.Map.Ghost(1, "Blinky"));
		map.defineObject("pinky", new Game.Map.Ghost(2, "Pinky"));
		map.defineObject("inky", new Game.Map.Ghost(3, "Inky"));
		map.defineObject("clyde", new Game.Map.Ghost(4, "Clyde"));
		map.defineObject("food", Game.Map.Food );
		map.scoreBoard(21,13,1);
		Game.Level01.buildMaze(map, this.Walls);

	},

	checkVictory: function(map) {
		if (map.getCount('food') == 0) { return true; };
		return false;
	},

	checkDefeat: function(map) {
		return true;
	},

	buildMaze: function(map, Walls) {
		for (var y = 0; y < Walls.length; y++) {
			for (var x = 0; x < Walls[y].length; x++) {
				switch( Walls[y][x] ) {
					case 'W': map.placeObject(x, y, 'block');
						break;
					case '*': map.placeObject(x, y, 'food');
						break;
					case 'P': map.addDynamic(x, y, "pinky");
						break;
					case 'B': map.addDynamic(x, y, "blinky");
						break;
					case 'I' : map.addDynamic(x, y, "inky");
						break;
					case 'C' : map.addDynamic(x, y, "clyde");
						break;
					case 'O' : map.placePlayer(x, y, 0);
								//map.placeObject(x+1, y, 'food');
						break;
				}
			};
		};
	},

	Walls: [
		'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
		'WWW***********************************____***********************************WWW',
		'WWW*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW__O_WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*WWW',
		'W*************************************____*************************************W',
		'W*W*WWWWWWWWWWWWWWWWW_WWWWWWWWWWWWWWWW_WW_WWWWWWWWWWWWWWWW_WWWWWWWWWWWWWWWWW*W*W',
		'W*W*WW*******************************W_WW_W*******************************WW*W*W',
		'W*W*WW*WWWWWWWWWWWWWWWWWWWWWWWWWWWWW*W_WW_W*WWWWWWWWWWWWWWWWWWWWWWWWWWWWW*WW*W*W',
		'W*W*WW*WW*************************WW*W_WW_W*WW*************************WW*WW*W*W',
		'W*W*WW*WW*WWWWWWWWWWWWWWWWWWWWWWW*WW*W_WW_W*WW*WWWWWWWWWWWWWWWWWWWWWWW*WW*WW*W*W',
		'W*W*WW*WW*WWWWWWWWWWWWWWWWWWWWWWW*WW*W_WW_W*WW*WWWWWWWWWWWWWWWWWWWWWWW*WW*WW*W*W',
		'W*W*WW*WW*WW___________________WW*WW*W_WW_W*WW*WWWWWWWWWWWWWWWWWWWWWWW*WW*WW*W*W',
		'W*W*WW*WW*WW___________________WW*WW*W_WW_W*WW*WWWWWWWWWWWWWWWWWWWWWWW*WW*WW*W*W',
		'W*W*WW*WW*WW___________________WW*WW*W_WW_W*WW*WWWWWWWWWWWWWWWWWWWWWWW*WW*WW*W*W',
		'W*W*WW*WW*WW___________________WW*WW*W****W*WW*WWWWWWWWWWWWWWWWWWWWWWW*WW*WW*W*W',
		'W*W*WW*__*WW___________________WW*WW*WWWWWW*WW*WWWWWWWWWWWWWWWWWWWWWWW*__*WW*W*W',
		'W*W*WW*WW*WW___________________WW*WW********WW*WWWWWWWWWWWWWWWWWWWWWWW*WW*WW*W*W',
		'W*W*WW*WW*WWWWWWWWWWWWWWWWWWWWWWW*WWWW_WW_WWWW*WWWWWWWWWWWWWWWWWWWWWWW*WW*WW*W*W',
		'W*W*WW*WW*WWWWWWWWWWWWWWWWWWWWWWW*WWWW_WW_WWWW*WWWWWWWWWWWWWWWWWWWWWWW*WW*WW*W*W',
		'W*W*WW*WW**************************************************************WW*WW*W*W',
		'W*W*__*WWWWW_WWWWWWWWWWWWWWWWWWWWWWWWW_PI_WWWWWWWWWWWWWWWWWWWWWWWWW_WWWWW*__*W*W',
		'W*W*WW*WWWWW_WWWWWWWWWWWWWWWWWWWWWWWWW_CB_WWWWWWWWWWWWWWWWWWWWWWWWW_WWWWW*WW*W*W',
		'W*W*WW*WW**************************************************************WW*WW*W*W',
		'W*W*WW*WW*WWWWWWWWWWWWWWWWWWWWWWW*WWWW_WW_WWWW*WWWWWWWWWWWWWWWWWWWWWWW*WW*WW*W*W',
		'W*W*WW*WW*WWWWWWWWWWWWWWWWWWWWWWW*WWWW_WW_WWWW*WWWWWWWWWWWWWWWWWWWWWWW*WW*WW*W*W',
		'W*W*WW*WW*WWWWWWWWWWWWWWWWWWWWWWW*WW********WW*WWWWWWWWWWWWWWWWWWWWWWW*WW*WW*W*W',
		'W*W*WW*__*WWWWWWWWWWWWWWWWWWWWWWW*WW*WWWWWW*WW*WWWWWWWWWWWWWWWWWWWWWWW*__*WW*W*W',
		'W*W*WW*WW*WWWWWWWWWWWWWWWWWWWWWWW*WW*W****W*WW*WWWWWWWWWWWWWWWWWWWWWWW*WW*WW*W*W',
		'W*W*WW*WW*WWWWWWWWWWWWWWWWWWWWWWW*WW*W*WW*W*WW*WWWWWWWWWWWWWWWWWWWWWWW*WW*WW*W*W',
		'W*W*WW*WW*WWWWWWWWWWWWWWWWWWWWWWW*WW*W*WW*W*WW*WWWWWWWWWWWWWWWWWWWWWWW*WW*WW*W*W',
		'W*W*WW*WW*WWWWWWWWWWWWWWWWWWWWWWW*WW*W*WW*W*WW*WWWWWWWWWWWWWWWWWWWWWWW*WW*WW*W*W',
		'W*W*WW*WW*WWWWWWWWWWWWWWWWWWWWWWW*WW*W*WW*W*WW*WWWWWWWWWWWWWWWWWWWWWWW*WW*WW*W*W',
		'W*W*WW*WW*WWWWWWWWWWWWWWWWWWWWWWW*WW*W*WW*W*WW*WWWWWWWWWWWWWWWWWWWWWWW*WW*WW*W*W',
		'W*W*WW*WW*************************WW*W*WW*W*WW*************************WW*WW*W*W',
		'W*W*WW*WWWWWWWWWWWWWWWWWWWWWWWWWWWWW*W*WW*W*WWWWWWWWWWWWWWWWWWWWWWWWWWWWW*WW*W*W',
		'W*W*WW*******************************W*WW*W*******************************WW*W*W',
		'W*W*WWWWWWWWWWWWWWWWW_WWWWWWWWWWWWWWWW*WW*WWWWWWWWWWWWWWWW_WWWWWWWWWWWWWWWWW*W*W',
		'W**************************************WW**************************************W',
		'WWW*WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW****WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW*WWW',
		'WWW************************************WW************************************WWW',
		'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW'
	]
}