/*global module:false*/

module.exports = function(grunt) {
  "use strict";

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),

    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>; */\n',

    // Task configuration.
    watch: {
      gurntfile: {
        files: 'Gruntfile.js',
        tasks: ['jshint:gruntfile'],
      },
      less: {
        files: ['src/css/*.less'],
        tasks: ['less:dev']
      },
      javascript: {
        files: ['src/js/*.js'],
        tasks: ['jshint:app', 'concat']
      }
    },

    clean: ['dist'],

    copy: {
      dev: {
        files: [
          { expand: true, cwd: 'src/', src: '*.{ico,txt}', dest: 'dist/' },
          { src: 'bower_components/modernizr/modernizr.js', dest: 'dist/js/modernizr.js' },
          { src: 'bower_components/jquery/jquery.js', dest: 'dist/js/jquery.js' },
          { src: 'bower_components/angular/angular.js', dest: 'dist/js/angular.js' },
          { src: 'bower_components/angular-route/angular-route.js', dest: 'dist/js/angular-route.js' },
          { src: 'bower_components/highcharts/highcharts.src.js', dest: 'dist/js/highcharts.js' },
          { expand: true, cwd: 'bower_components/bootstrap/dist/', src: ['fonts/**'], dest: 'dist/' }
        ]
      },
      release: {
        files: [
          { expand: true, cwd: 'src/', src: '*.{ico,txt}', dest: 'dist/' },
          { src: 'bower_components/modernizr/modernizr.js', dest: 'dist/js/modernizr.js' },
          { src: 'bower_components/jquery/jquery.min.js', dest: 'dist/js/jquery.js' },
          { src: 'bower_components/jquery/jquery.min.map', dest: 'dist/js/jquery.min.map' },
          { src: 'bower_components/angular/angular.min.js', dest: 'dist/js/angular.js' },
          { src: 'bower_components/angular/angular.min.js.map', dest: 'dist/js/angular.min.js.map' },
          { src: 'bower_components/angular-route/angular-route.min.js', dest: 'dist/js/angular-route.js' },
          { src: 'bower_components/angular-route/angular-route.min.map', dest: 'dist/js/angular-route.min.js.map' },
          { src: 'bower_components/highcharts/highcharts.js', dest: 'dist/js/highcharts.js' },
          { expand: true, cwd: 'bower_components/bootstrap/dist/', src: ['fonts/**'], dest: 'dist/' }
        ]
      }
    },

    less: {
      options: {
        paths: ['bower_components', ],
      },
      dev: {
        options: {},
        files: {
          'dist/css/bootstrap.css': ['src/css/bootstrap/bootstrap.less'],
          'dist/css/app.css': ['src/css/app.less']
        }
      },
      release: {
        options: {
          cleancss: true,
          report: 'min'
        },
        files: {
          'dist/css/bootstrap.css': ['src/css/bootstrap/bootstrap.less'],
          'dist/css/app.css': ['src/css/app.less']
        }
      }
    },

    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      app: {
        files: {
          'dist/js/bootstrap.js': [
            'src/lib/bootstrap/js/transition.js',
            'src/lib/bootstrap/js/button.js'
          ],
          'dist/js/app.js': [
            'src/js/plugins.js',
            'src/js/services.js',
            'src/js/filters.js',
            'src/js/directives.js',
            'src/js/controllers.js',
            'src/js/app.js'
          ]
        }
      }
    },

    uglify: {
      options: {
        banner: '<%= banner %>',
        mangle: {
          except: []
        },
        preserveComments: false
      },
      app: {
        files: {
          'dist/js/bootstrap.js': 'dist/js/bootstrap.js',
          'dist/js/app.js': 'dist/js/app.js'
        }
      }
    },

    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: false,
        boss: true,
        eqnull: true,
        browser: true,
        globalstrict: true,
        globals: { "Modernizr": true, "angular": true, "Highcharts": true, "NProgress": true }
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      app: {
        src: 'src/js/*.js',
        options: {
          ignores: 'src/js/plugins.js'
        }
      }
    },

    connect: {
      server: {
        options: {
          keepalive: true,
          port: 5001,
          base: 'dist'
        }
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-less');

  // Default task.
  grunt.registerTask('default', ['jshint', 'clean', 'copy:dev', 'less:dev', 'concat']);
  grunt.registerTask('release', ['jshint', 'clean', 'copy:release', 'less:release', 'concat', 'uglify']);

};
