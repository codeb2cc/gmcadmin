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
        tasks: ['recess']
      },
      javascript: {
        files: ['src/js/*.js'],
        tasks: ['concat']
      }
    },

    clean: ['dist'],

    copy: {
      dev: {
        files: [
          { expand: true, cwd: 'src/', src: '*.{ico,txt}', dest: 'dist/' },
          { src: 'src/lib/modernizr/modernizr-2.6.2.js', dest: 'dist/js/modernizr.js' },
          { src: 'src/lib/jquery/jquery-2.0.3.js', dest: 'dist/js/jquery.js' },
          { src: 'src/lib/angular/angular.js', dest: 'dist/js/angular.js' },
          { src: 'src/lib/angular/angular-route.js', dest: 'dist/js/angular-route.js' },
          { src: 'src/lib/highcharts/highcharts.js', dest: 'dist/js/highcharts.js' },
          { expand: true, cwd: 'src/lib/bootstrap/', src: ['fonts/**'], dest: 'dist/' }
        ]
      },
      release: {
        files: [
          { expand: true, cwd: 'src/', src: '*.{ico,txt}', dest: 'dist/' },
          { src: 'src/lib/modernizr/modernizr-2.6.2.min.js', dest: 'dist/js/modernizr.js' },
          { src: 'src/lib/jquery/jquery-2.0.3.min.js', dest: 'dist/js/jquery.js' },
          { src: 'src/lib/jquery/jquery-2.0.3.min.map', dest: 'dist/js/jquery.min.map' },
          { src: 'src/lib/angular/angular.min.js', dest: 'dist/js/angular.js' },
          { src: 'src/lib/angular/angular.min.js.map', dest: 'dist/js/angular.min.js.map' },
          { src: 'src/lib/angular/angular-route.min.js', dest: 'dist/js/angular-route.js' },
          { src: 'src/lib/angular/angular-route.min.map', dest: 'dist/js/angular-route.min.js.map' },
          { src: 'src/lib/highcharts/highcharts.min.js', dest: 'dist/js/highcharts.js' },
          { expand: true, cwd: 'src/lib/bootstrap/', src: ['fonts/**'], dest: 'dist/' }
        ]
      }
    },

    recess: {
      options: {
        compile: true,
        compress: false
      },
      bootstrap: {
        src: ['src/lib/bootstrap/less/bootstrap.less'],
        dest: 'dist/css/bootstrap.css'
      },
      app: {
        src: ['src/css/app.less'],
        dest: 'dist/css/app.css'
      }
    },

    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      bootstrap: {
        src: [
          'src/lib/bootstrap/js/transition.js',
          'src/lib/bootstrap/js/button.js',
          'src/lib/bootstrap/js/dropdown.js',
          'src/lib/bootstrap/js/modal.js'
        ],
        dest: 'dist/js/bootstrap.js'
      },
      app: {
        src: [
          'src/lib/plugins.js',
          'src/js/services.js',
          'src/js/filters.js',
          'src/js/directives.js',
          'src/js/controllers.js',
          'src/js/app.js'
        ],
        dest: 'dist/js/app.js'
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
      bootstrap: {
        src: '<%= concat.bootstrap.dest %>',
        dest: '<%= concat.bootstrap.dest %>',
      },
      app: {
        src: '<%= concat.app.dest %>',
        dest: '<%= concat.app.dest %>',
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
        unused: true,
        boss: true,
        eqnull: true,
        browser: true,
        globals: {}
      },
      gruntfile: {
        src: 'Gruntfile.js'
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
  grunt.loadNpmTasks('grunt-recess');

  // Default task.
  grunt.registerTask('default', ['jshint', 'clean', 'copy:dev', 'recess', 'concat']);
  grunt.registerTask('release', ['jshint', 'clean', 'copy:release', 'recess', 'concat', 'uglify']);

};
