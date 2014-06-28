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
    amountHands 	: 8,
    possibleHands	: [
    					{
							file:'lady.png',
							topSpeed:3,
						},
						{
							file:'man.png',
							topSpeed:2.5,
						},
						{
							file:'muscle-man.png',
							topSpeed:2,
						},
						{
							file:'old-lady.png',
							topSpeed:1.5,
						}
    				  ],
  	handLocations 	: [],
    hands 			: [],
    stationaryHands : [],
  	handTimer		: null,
  	gameStillRunning : true,
  	handChooseSpeed : 1000,
  	cakeLocation	: null,
  	debugDot 		: null,
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

		// grab all the hands and set them up
		for(var i = 0; i < core.amountHands; i ++){
			var handSettings = core.possibleHands[Math.floor(Math.random()*core.possibleHands.length)];
			handSprite = new core.Hand(i, handSettings);
		};

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
			once:false,
			speed:1
		};
		var cakeImage = new core.SpriteSheet(cakeOptions).start();
		core.state.sprites.push(cakeImage);
		core.cake = cakeImage;

		core.debugDot = new core.DebugDot();

		core.setEvents();

		// set the scene sizes up
		core.resizeWindowCallback();

		// start the game
		core.play();

		// start the shuffle of the hands
		core.tick();

	},

	// this runs when someone got the cake
	gotTheCake: function(){
		core.pause();
		core.gameStillRunning = false;
		$('#lose-container').show();
		$('#lose strong').html(core.currentScore);
	},

	playAgain: function(){
		$('#lose-container').hide();
		// set some new hands up and reset the speeds of those hands
		for(var i = 0; i < core.hands.length; i ++){
			var hand = core.hands[i];
			var randomHand = core.possibleHands[Math.floor(Math.random()*core.possibleHands.length)];
			hand.topSpeed = randomHand.topSpeed;
			hand.img = new Image();
			hand.retreating = false;
			hand.img.src = 'assets/img/'+randomHand.file;
			hand.clear();
		};
		core.resizeWindowCallback();
		core.currentScore = 0;
		$('#best-score').html(core.bestScore);
		core.gameStillRunning = true;
		core.handChooseSpeed = 1000;
		core.tick();
		core.play();
	},

	// this function starts the timer that will poke all the arms out
	tick: function(){

		if (core.stationaryHands.length <= 0){
			return false;
		}

		// grab a random hand (never the same one as the last one picked)
		var handToMove = core.stationaryHands[Math.floor(Math.random()*core.stationaryHands.length)];

		//var handToMove = core.hands[Math.floor(Math.random()*core.hands.length)];
		handToMove.target = core.cakeLocation;
		handToMove.moving = true;
		handToMove.newTarget = true;

        core.handChooseSpeed -= 3;

        if (core.gameStillRunning){
            core.handTimer = window.setTimeout(core.tick.bind(this), core.handChooseSpeed);
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
			for(var i = 0; i < core.hands.length; i ++){
				var hand = core.hands[i],
					// create an unlinked copy of location
					locationSnapshot = $.extend({}, hand.location);

				// if click inside the sprite location
				if( (clickX - core.handicap) < (locationSnapshot.x + hand.outputWidth) &&
					(clickX + core.handicap) > locationSnapshot.x &&
					(clickY + core.handicap) > locationSnapshot.y &&
					(clickY - core.handicap) < (locationSnapshot.y + hand.outputHeight) ){
					hand.target = hand.startLocation;
					hand.newTarget = true;
					hand.retreating = true;
				}
			}

			return false;

		});

	},

	// update function this is called each frame
	update: function(dt){

		// clear the list of hands that are not moving
		core.stationaryHands = [];

		// call the update for the sprites here
		for(var i = 0; i < core.state.sprites.length; i ++){
			var sprite = core.state.sprites[i];
			sprite.update(dt);
			// if its a hand and its not moving, add it to the list of stationary hands (for random picking)
			if(sprite.angle && sprite.moving === false){
				core.stationaryHands.push(sprite);
			}
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

		core.handLocations = [  {x:core.gridWidth * -1, y: -core.height, angle: 150},
		  						{x:core.gridWidth * 2, y: -core.height, angle: 175},
		  						{x:core.gridWidth * 5, y: -core.height, angle: 185},
		  						{x:core.gridWidth * 8.5, y: -core.height, angle: 200},
		  						{x:core.gridWidth * -1, y: core.height, angle: 10},
		  						{x:core.gridWidth * 2, y: core.height, angle: 5},
		  						{x:core.gridWidth * 5, y: core.height, angle: -5},
		  						{x:core.gridWidth * 8.5, y: core.height, angle: -10} ];

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

		core.cakeLocation = new core.Vector2D( core.width / 2, core.height / 2);
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

    updateSprites: function(){

    	// update hand locations
    	for(var i = 0; i < core.hands.length; i ++){
    		var hand = core.hands[i];
    		hand.location.x = core.handLocations[i].x;
    		hand.location.y = core.handLocations[i].y;
			hand.outputHeight *= core.xRatio;
    		hand.outputWidth *= core.xRatio;
    		hand.topSpeed *= core.xRatio;
    	};

    	// update cake location
    	if(core.cake){
	    	core.cake.location.x = (core.width / 2) - (core.cake.outputWidth / 2);
			core.cake.location.y = (core.height / 2) - (core.cake.outputHeight / 2);
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