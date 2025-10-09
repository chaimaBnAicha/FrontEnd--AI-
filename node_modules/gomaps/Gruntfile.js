module.exports = function(grunt) {
  'use strict';

  var banner =  '/*!\n' +
                ' * <%= pkg.name %> v<%= pkg.version %> (<%= pkg.homepage %>)\n' +
                ' * <%= pkg.author.name %> (<%= pkg.author.url %>)\n' +
                ' * Copyright 2017-<%= grunt.template.today("yyyy") %> <%= pkg.author.name %>\n' +
                ' * Licensed under MIT license\n' +
                ' */';

	grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

		copy: {
				dist: {
						files: [{
								expand: true,
								src: ['gomaps.js'],
								dest: 'dist/'
						}]
				}
		},

    comments: {
      dist: {
        options: {
            singleline: true,
            multiline: true
        },
        src: [ 'dist/gomaps.js']
      },
    },

		uglify: {
			dist: {
				files: {
					'dist/gomaps.min.js': ['dist/gomaps.js']
				}
			}
		},

    'string-replace': {
			dist: {
				files: {
          'gomaps.js': 'gomaps.js',
				},
				options: {
					replacements: [{
						pattern: /\/\*\![\s\S]*\*\//,
						replacement: '',
					}]
				}
			}
		},

		usebanner: {
			main: {
				options: {
					position: 'top',
					banner: banner,
					linebreak: false
				},
				files: {
					src: [ 'gomaps.js', 'dist/gomaps.js' ]
				}
			},
      dist: {
				options: {
					position: 'top',
					banner: banner + '\n',
					linebreak: false
				},
				files: {
					src: [ 'dist/gomaps.min.js' ]
				}
			}
		},

    browserify: {
      dist: {
        files: {
          'examples/browserify/browserify-main.js': ['examples/browserify/browserify-entry.js']
        }
      }
    },

  });

	grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-stripcomments');
  grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-string-replace');
	grunt.loadNpmTasks('grunt-banner');
  grunt.loadNpmTasks('grunt-browserify');

  // Default task.
  grunt.registerTask('default', ['string-replace', 'copy', 'comments', 'uglify', 'usebanner:main', 'usebanner:dist', 'browserify']);

};
