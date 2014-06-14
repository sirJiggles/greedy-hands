/* This is the main container for the game, should be the only real global var */

var core = {

	// set all the properties of the core
	canvases		: {
						debug: document.getElementById('debugLayer'),
						cake: document.getElementById('cake')
					  },
	interval		: 1000 / 60,
    lastTime		: (new Date()).getTime(),
    currentTime		: 0,
    delta			: 0,
    state 	 		: {
			    		sprites 	: [],
			    		sounds 		: []
					  },
    resizeTimer 	: null,
    debugMode 		: true,
    playSounds		: false,
    // set the width and height as the optimal height and width
    width 			: 500,
    height 			: 300,
    widthToHeight	: 5 / 3,
    handicap		: 20,
    gridWidth		: 500 / 10,
    gridHeight		: 300 / 10,
    possibleHands	: [
    					{
							file:'lady.png',
							topSpeed:30,
						},
						{
							file:'man.png',
							topSpeed:25,
						},
						{
							file:'muscle-man.png',
							topSpeed:20,
						},
						{
							file:'old-lady.png',
							topSpeed:15,
						}
    				  ],
  	handLocations 	: [],
    hands 			: [],
  	handTimer		: null,
  	cakeLocation	: null,
  	debugDot 		: null,
  	armLength 		: 450,
  	lastHandPicked  : null,
  	currentScore	: 0,
  	bestScore		: 5000,
  	scoreContainer  : $('#score em'),

	// init function
	init: function(){

		// init the math utils
		core.maths = new core.MathUtils();

		// set the best score
		$('#best-score').html(core.bestScore);

		// set the scene sizes up
		core.resizeWindowCallback();

		core.cakeLocation = new core.Vector2D( core.width / 2, core.height / 2);

		// grab all the hands and set them up
		$.each($('.hand'), function(index, hand){
			core.canvases['hand-'+index] = hand;
			// get some random hand settings
			var handSettings = core.possibleHands[Math.floor(Math.random()*core.possibleHands.length)];
			// create a new sprite with it
			handSprite = new core.Hand(index, handSettings);
		});

		var cakeOptions = {
			frames:0,
			file:'assets/img/cupcake.png',
			width:300,
			height:345,
			outputWidth:90,
			outputHeight:102,
			x:core.cakeLocation.x + this.outputWidth / 2,
			y:core.cakeLocation.y + this.outputHeight / 2,
			canvas:core.canvases.cake,
			once:false
		};
		var cakeImage = new core.SpriteSheet(cakeOptions).start();
		core.state.sprites.push(cakeImage);

		core.debugDot = new core.DebugDot();

		// set the scene sizes up
		core.resizeWindowCallback();

		core.setEvents();	

		// start the game
		core.play();

		// start the shuffle of the hands
		core.startHandShuffle();
		
	},

	// this runs when someone got the cake
	gotTheCake: function(){
		/*core.pause();
		clearInterval(core.handTimer);
		$('#lose-container').show();
		$('#lose strong').html(core.currentScore);*/
	},

	playAgain: function(){
		$('#lose-container').hide();
		// set some new hands up and reset the speeds of those hands
		$.each(core.state.sprites, function(index, sprite){
			if(typeof sprite.angle !== 'undefined' && sprite.angle){
				var randomHand = core.possibleHands[Math.floor(Math.random()*core.possibleHands.length)];
				sprite.topSpeed = randomHand.topSpeed;
				sprite.img = new Image();
				sprite.img.src = 'assets/img/'+randomHand.file;
				sprite.clear();
			};
		});
		core.resizeWindowCallback();
		core.currentScore = 0;
		$('#best-score').html(core.bestScore);
		core.play();
		core.startHandShuffle();
	},

	// this function starts the timer that will poke all the arms out
	startHandShuffle: function(){
		core.handTimer = window.setInterval(function(){

			// grab a random hand (never the same one as the last one picked)
			var handToMove = core.selectRandomHand();

			handToMove.target = core.cakeLocation;
			handToMove.moving = true;
			handToMove.newTarget = true;

			core.lastHandPicked = handToMove;

		}, 1000);
	},

	selectRandomHand: function(){
		var handToMove = core.hands[Math.floor(Math.random()*core.hands.length)];
		if(handToMove != core.lastHandPicked && handToMove.moving == false){
			return handToMove;
		}else{
			return core.selectRandomHand();
		}
	},

	setEvents: function(){

		window.addEventListener('click', function(evt) {
		    evt.preventDefault();
		    evt.stopPropagation();
		    return false;
		}, false);

		$('#play-again').click(function(evt){
			evt.preventDefault();
			core.playAgain();
		});

		// Clicking the hands functionality
		$('#game-inner').on('click', function(evt){

			evt.preventDefault();
			evt.stopPropagation();

			// get the location of the click
			var offset = $(this).offset(),
				clickX = evt.pageX - offset.left,
				clickY = evt.pageY - offset.top;

			// loop through all the sprites and check if the click is within one of the arms current locations
			for(var i = 0; i < core.state.sprites.length; i ++){
				var sprite = core.state.sprites[i],
					// create an unlinked copy of location
					locationSnapshot = $.extend({}, sprite.location);

				// if click inside the sprite location
				if( (clickX - core.handicap) < (locationSnapshot.x + sprite.outputWidth) &&
					(clickX + core.handicap) > locationSnapshot.x &&
					(clickY + core.handicap) > locationSnapshot.y &&
					(clickY - core.handicap) < (locationSnapshot.y + sprite.outputHeight) ){
					sprite.target = sprite.startLocation;
					sprite.newTarget = true;
				}
			}

			return false;

		});

	},

	// update function this is called each frame
	update: function(dt){

		// call the update for the sprites here
		for(var i = 0; i < core.state.sprites.length; i ++){
			core.state.sprites[i].update(dt);
		}

		// update the score
		core.currentScore += 1;
		core.scoreContainer.html(core.currentScore);
		if(core.currentScore > core.bestScore){
			core.bestScore = core.currentScore;
		}
		
	},

	pause: function(){
		requestAnimFrame = null;
	},

	// game loop function
	play: function(){

		// shim layer with setTimeout fallback
		window.requestAnimFrame = (function(){
		  return  window.requestAnimationFrame       ||
		          window.webkitRequestAnimationFrame ||
		          window.mozRequestAnimationFrame    ||
		          function(callback){
		            window.setTimeout(callback, core.interval);
		          };
		})();

		(function animloop(){
			
			core.currentTime = (new Date()).getTime();
    		core.delta = (core.currentTime - core.lastTime);

			// if at least 1 frame has passed in time (1000/fps)
    		if(core.delta > core.interval) {

				// step the game
				core.update(core.delta);

    			// set the last time
				core.lastTime = core.currentTime - (core.delta % core.interval);
			}

			// call this again on animation frame
			if(requestAnimFrame){
				requestAnimFrame(animloop);
			}

		})();
	}, // end the game loop

	// simple debuging helper
	debug: function(msg, lvl){
		console.log('================== DEBUG MSG ===============');
		console.log(msg);
		if(typeof lvl !== 'undefined'){
			console.log(' WARNING LVL: '+lvl);
		}
		console.log('================= END DEBUG ================');
	},

	// handle any window resize here
	resizeWindowCallback: function(){

		var previousWidth = core.width,
			previousHeight = core.height,
			wrapper = $('#game-wrapper'),
			inner = $('#game-inner');

		core.width =  $(wrapper).innerWidth();
		core.height = $(wrapper).innerHeight();

		core.gridWidth = core.width / 10;
		core.gridHeight = core.height / 10;

		core.handLocations = [  {x:core.gridWidth * -1, y: -core.armLength, angle: 150},
		  						{x:core.gridWidth * 2, y: -core.armLength, angle: 175},
		  						{x:core.gridWidth * 5, y: -core.armLength, angle: 185},
		  						{x:core.gridWidth * 8.5, y: -core.armLength, angle: 200},
		  						{x:core.gridWidth * -1, y: core.height, angle: 10},
		  						{x:core.gridWidth * 2, y: core.height, angle: 5},
		  						{x:core.gridWidth * 5, y: core.height, angle: -5},
		  						{x:core.gridWidth * 8.5, y: core.height, angle: -10},
		  						{x:core.gridWidth * -4, y: core.gridHeight * -1, angle: 110},
		  						{x:core.gridWidth * -4, y: core.gridHeight * 3, angle: 90},
		  						{x:core.gridWidth * -4, y: core.gridHeight * 6, angle: 70},
		  						{x:core.gridWidth * 12, y: core.gridHeight * -1, angle: -110},
		  						{x:core.gridWidth * 12, y: core.gridHeight * 3, angle: -90},
		  						{x:core.gridWidth * 12, y: core.gridHeight * 6, angle: -70} ];

		var newWidthToHeight = core.width / core.height;
		if(newWidthToHeight > core.widthToHeight){
			core.width = core.height * core.widthToHeight;
		}else{
			core.height = core.width / core.widthToHeight;
		}

		$(inner).css({
			'width': core.width,
			'height': core.height,
			'margin-top':-core.height / 2,
			'margin-left':-core.width / 2
		});

		//core.cakeLocation = new core.Vector2D( core.width / 2, core.height / 2);
		if(core.hands.length > 0){
			core.cakeLocation.x = (core.width / 2) - (core.hands[0].outputWidth / 2);
			core.cakeLocation.y = (core.height / 2) - (core.hands[0].outputHeight / 2);
		}

		core.xRatio = core.width / previousWidth;
		core.yRatio = core.height / previousHeight;

		core.updateSprites(true);

		core.resizeCanvs();

		if(core.debugMode){
			core.updateDebug();
		}
    },

    // a debug function only for debug mode redraw updates
    updateDebug: function(){
		if(core.debugDot){
    		core.debugDot.draw(core.cakeLocation);
		}
    },

    updateSprites: function(locationAlso){
   
   		// update the location, speed and the size of the sprites
    	for(var i = 0; i < core.state.sprites.length; i ++){
    		var sprite = core.state.sprites[i];
    		sprite.moving = false;
    		if(typeof sprite.location !== 'undefined' && locationAlso){
    			if(typeof sprite.angle !== 'undefined' && sprite.angle){
	    			sprite.location.x = core.handLocations[i].x;
					sprite.location.y = core.handLocations[i].y;
				}else{
					sprite.location.x = (core.width / 2) - (sprite.outputWidth / 2);
					sprite.location.y = (core.height / 2) - (sprite.outputHeight / 2);
				}
    		}
    		// set the height to be the same as width to maintain the aspect ratio
    		sprite.outputHeight *= core.xRatio;
    		sprite.outputWidth *= core.xRatio;
    		sprite.topSpeed *= core.xRatio;
    		sprite.clear();
    	}

    },

    clearScreen: function(){
    	for(var i = 0; i < core.state.sprites.length; i ++){
    		core.state.sprites[i].clear();
    	}
    },

    resizeCanvs: function(){
    	// resize all of the canvases on the screen to be the same as the window or 'core'
    	$.each(core.canvases, function(index, canvas){
    		canvas.width = core.width;
    		canvas.height = core.height;
    	});

		// work out based on the width and the height of the window what the ratio of widths and heights for the graph is
		core.graphWidthMagnifier = core.width / core.graphSize;
		core.graphHeightMagnifier = core.height / core.graphSize;
    },

    playSound: function(index, loop){
    	if(!core.playSounds){ return; }
    	core.state.sounds[index].play();
		if(loop){
    		core.state.sounds[index].loop = true;
    	}
    	
    },
    stopSound:  function(index){
    	core.state.sounds[index].pause();	
    },
    clearSounds: function(){
    	for(var i = 0; i < core.state.sounds.length; i++){
    		core.state.sounds[i].pause();
    	}
    	// reset the array
    	core.state.sounds = [];
    },

    // sanity check utils function
    sanityCheck : function(vars){
    	for(var i = 0; i < vars.length; i ++){
    		if(typeof vars[i] === 'undefined'){
    			return false;
    		}
    	}
    	return true;
    }

} // end the core