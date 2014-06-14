module.exports = function(grunt) {

	// Load the tasks form the custom node modules we have installed
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-compass');
  	grunt.loadNpmTasks('grunt-contrib-watch');
  	grunt.loadNpmTasks('grunt-shell');

  	// define our sass and js locations
  	var sasslocations = ['assets/sass/*.scss', 
						'assets/sass/views/*.scss', 
						'assets/sass/includes/*.scss',
						'assets/sass/partials/*.scss'];

  	var jsLocations= ['assets/js/script.js',
					'assets/js/vendor/*.js',
					'assets/js/app/*.js',
					'assets/js/app/**/*.js'];

  	// start the config for grunt
	grunt.initConfig({

		clean:{
			dev: ['assets/css'],
			build: ['assets/css']
		},
		compass: {
		  	dev: {
		    	options: {
					cssDir: 'assets/css',
					sassDir: 'assets/sass',
					imagesDir: 'assets/img',
					javascriptsDir: 'assets/js',
					outputStyle:'expanded',
					assetCacheBuster: false
			    }
			},
			build:{

				options: {
					cssDir: 'assets/css',
					sassDir: 'assets/sass',
					imagesDir: 'assets/img',
					javascriptsDir: 'assets/js',
					outputStyle:'compressed'
			    }
				
			}
		},
		shell:{
			dev: {
				command: 'juicer merge -s assets/js/script.js --force -m ""'
			},
			build: {
				command: 'juicer merge -s assets/js/script.js --force'
			}
		},
		watch: {
			compass: {
				files: sasslocations,
				tasks: ['compass:dev']
			},
			shell:{
				files: jsLocations,
				tasks: ['shell:dev']
			}
		}

	})


	// create some new tasks for dev and buid, these pass round different vars to the config settings
    grunt.registerTask('dev', [
      'clean:dev',
      'compass:dev',
      'shell:dev',
      'watch'
    ]);

    grunt.registerTask('build', [
      'clean:build',
      'compass:build',
      'shell:build',
      'watch'
    ]);


  	grunt.registerTask('default', ['build']);
	
};