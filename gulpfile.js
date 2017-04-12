// Requis
var gulp = require('gulp');
var browserSync = require('browser-sync');
var browserify = require('gulp-browserify');
var rename = require('gulp-rename');
var minify = require('gulp-minify');

// Include plugins
var plugins = require('gulp-load-plugins')(); // tous les plugins de package.json

gulp.task('browserify', function() {
  // Single entry point to browserify 
  gulp.src('./lib/client.js')
    .pipe(browserify({
      insertGlobals : true,
      debug : !gulp.env.production
    }))
    .pipe(rename('results.js'))
    .pipe(gulp.dest('./public/javascripts/'))
});

gulp.task('compress', function() {
  gulp.src('public/javascripts/*.js')
    .pipe(minify({
        ext:{
            src:'-debug.js',
            min:'.js'
        },
        exclude: ['tasks'],
        ignoreFiles: ['.combo.js', '-min.js]'
    }))
    .pipe(gulp.dest('public/js'))
});


// Tâche "build" = SASS + autoprefixer + CSScomb + beautify (source -> destination)
gulp.task('css', function () {
  return gulp.src('./public/stylesheets/knacss.scss')
    .pipe(plugins.sass())
    .pipe(plugins.csscomb())
    .pipe(plugins.cssbeautify({indent: '  '}))
    .pipe(plugins.autoprefixer())
    .pipe(gulp.dest('./public/stylesheets/'));
});

// Tâche "minify" = minification CSS (destination -> destination)
gulp.task('minify', function () {
  return gulp.src('./public/stylesheets/knacss.css')
    .pipe(plugins.csso())
    .pipe(plugins.rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./public/stylesheets/'));
});


//Tâche nodemon
gulp.task('nodemon', function (cb) {
  
  var started = false;
  
  return plugins.nodemon({
    script: './bin/www'
  })
    .on('start', function () {
      // to avoid nodemon being started multiple times
      // thanks @matthisk
      if (!started) {
	cb();
	started = true; 
      } 
    })
    .on('restart', function () {
      setTimeout(function () {
	browserSync.reload({ stream: false });
      }, 1000);
    });
});

//Tâche browser-sync
gulp.task('browser-sync',['nodemon'], function(cb){
  browserSync.init({
    proxy: "localhost:3000",
    port: 5000
  })
})


// Tâche "build"
gulp.task('build', ['css','minify']);

// Tâche "prod" = Build + minify
gulp.task('prod', ['build', 'minify']);

// Tâche "watch" = je surveille *scss
gulp.task('watch', function () {
  gulp.watch('./public/stylesheets/*.scss', ['build']);
  gulp.watch('./public/javascripts/*.js',['browserify'])
  gulp.watch(['./public/stylesheets/*.css',
	      './views/**/*.ejs'],
	     browserSync.reload);
});

// Tâche par défaut
gulp.task('default', ['build']);

// Tâche par défaut
gulp.task('dev', ['watch',"browser-sync"]);
