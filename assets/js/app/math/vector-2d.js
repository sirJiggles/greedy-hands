/* Vector 2d class for common vector operations */

core.Vector2D = function(x, y){

	// can also create a new vector from another co-ords
	if(typeof x === 'object'){
		this.x = x.x;
		this.y = x.y;
	}else{
		this.x = (typeof x !== 'undefined') ? x : 0;
		this.y = (typeof y !== 'undefined') ? y : 0;
	}

	return this;
}

// addition
core.Vector2D.prototype.add = function(v){
	this.x = this.x + v.x,
	this.y = this.y + v.y;

	return this;
}

// subtraction
core.Vector2D.prototype.sub = function(v){
	this.x = this.x - v.x,
	this.y = this.y - v.y;

	return this;
}

// multiplication (scale by number)
core.Vector2D.prototype.mult = function(n){
	this.x = this.x * n;
	this.y = this.y * n;

	return this;
}

// magnitude using Pythagorean theorem (used to get the length of a vector)
core.Vector2D.prototype.mag = function(){
	return(Math.sqrt( (this.x * this.x) + (this.y * this.y) ) );
}

// scale with division
core.Vector2D.prototype.div = function(n){
	this.x = this.x / n,
	this.y = this.y / n;

	return this;
}

// normalize vector
core.Vector2D.prototype.normalize = function(){
	// as an example 
	var m = this.mag();
	if(m != 0){
		this.div(m);
	}
}

// dot product (common use to find angle between two vectors)
core.Vector2D.prototype.dot = function(v){
	return ( (this.x * v.x) + (this.y * v.y));
}

// distance from this to another vector
core.Vector2D.prototype.dist = function(v){

	return Math.sqrt(  
				Math.pow((this.x - v.x), 2) + 
				Math.pow((this.y - v.y), 2)
			);
}