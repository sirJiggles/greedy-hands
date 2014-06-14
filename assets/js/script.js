
/*
 * Main javascript file
 * 
 * require all js files in order using juicer
 * 
 * @depends vendor/jquery-2.1.0.min.js
 * @depends vendor/fastclick.js
 * @depends app/core.js
 * @depends app/math/vector-2d.js
 * @depends app/math/utils.js
 * @depends app/lib/mover.js
 * @depends app/lib/sprite-sheet.js
 * @depends app/lib/hand.js
 * @depends app/lib/debug-dot.js
 */

// On load
$(window).load(function () {

	// set up fast click (makes things awesome!)
	$(function() {
	    FastClick.attach(document.body);
	});

    // start the madness
    core.init();
});

// On resize
$(window).resize(function(){
    clearTimeout(core.resizeTimer);
    core.resizeTimer = setTimeout(core.resizeWindowCallback, 20);
});
