Game.Map.Food = {
	tile: 5,
	frame: 1,
	onCollision: function(me, player) {
		player.nom(me);
	}
};