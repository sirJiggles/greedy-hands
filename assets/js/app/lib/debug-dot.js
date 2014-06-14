/* this is just used to show some debug positions */

core.DebugDot = function(options){
	
	this.canvas = core.canvases['debug'];
	this.ctx = this.canvas.getContext('2d');
	this.radius = 10;

	// if there is some customizations
	if(typeof options !== 'undefined'){
		this.color = (typeof options.color !== 'undefined') ? options.color : 'green';
	}else{
		this.color = 'green';
	}
}

core.DebugDot.prototype.clear = function(){
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
}

core.DebugDot.prototype.draw = function(location){
	
	this.ctx.beginPath();
  	this.ctx.arc(location.x, location.y, this.radius, 0, 2 * Math.PI, false);
	this.ctx.fillStyle = this.color;
	this.ctx.fill();
	this.ctx.stroke();
}