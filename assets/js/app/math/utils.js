/* handy math functions */
core.MathUtils = function(){
	
	this.debugDot = new core.DebugDot({color:'blue'});
}

// Get the angle between two vectors */
core.MathUtils.prototype.angleBetween = function(v1, v2){
	if(typeof v1 !== 'object' && typeof v2 !== 'object'){
		core.debug('call to angle between with incorrect types', 'Warning');
		return false;
	}

	var dot = v1.dot(v2);
	var theta = Math.acos(dot / (v1.mag() * v2.mag()));
	return theta;
}

// get the normal point between start and end of path for a position vector (scalar projection)
core.MathUtils.prototype.getNormalPoint = function(path, predictedLoc){

	// vector from the start of the line to the predicted location
	var a = new core.Vector2D(predictedLoc);
	a.sub(path.start);

	// vector from start to end of line segment
	var b = new core.Vector2D(path.end);
	b.sub(path.start);

	b.normalize();
	// A.B = ||A|| * 1 * cos(theta)
	b.mult(a.dot(b));
	
	var normalPoint = new core.Vector2D(b);
	normalPoint.add(path.start);

	if(core.debugMode){
		this.debugDot.draw(normalPoint);
	}

	return normalPoint;
}

// function to check if vector values are about the same value :D
core.MathUtils.prototype.aboutTheSame = function(va, vb, factor){

	var testX = false,
		testY = false;

	if( Math.abs(va.x - vb.x) < factor){
		testX = true;
	}
	if( Math.abs(va.y - vb.y) < factor){
		testY = true;
	}

	var result = (testX && testY) ? true : false;
	return result;
}

core.MathUtils.prototype.getMiddlePoint = function(va, vb){
	var mid = new core.Vector2D();
	mid.x = (va.x + vb.x) / 2;
	mid.y = (va.y + vb.y) / 2;
	return mid;
}