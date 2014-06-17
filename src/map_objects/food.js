Game.Map.Food = {
	color:"#0f0",
	onCollision: function(me, player) {
		player.nom(me);
	}
};