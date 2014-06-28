/* Set up the hands */

core.Hand = function(index, hand){

	// set up the options for the hand
	this.canvas = document.getElementById('hand-'+index);
	this.file =  "assets/img/" + hand.file;
	this.frames = 0;
	this.width = 128;
	this.height = 291;
	this.speed = 1;
	this.outputWidth = 128 * core.xRatio;
	this.outputHeight = 291 * core.xRatio;
	this.once = false;
	// make top and bottom row of hands half as fast as side hands
	this.topSpeed = hand.topSpeed;
	this.x = core.handLocations[index].x;
	this.y = core.handLocations[index].y;
	this.angle = (typeof core.handLocations[index].angle !== 'undefined') ? core.handLocations[index].angle : undefined;
	
	this.sprite = new core.SpriteSheet(this).start();

	core.state.sprites.push(this.sprite);
	core.hands.push(this.sprite);
	core.canvases['hand-'+index] = this.canvas;
}