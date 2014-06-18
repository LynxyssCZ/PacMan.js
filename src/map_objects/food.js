Game.Map.Food = {
	tile: 5,
	frame: 1,
	value: 10,
	onCollision: function(me, player) {
		me.value = this.value;
		player.nom(me);
		return true;
	}
};