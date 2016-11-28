// Requis
var gulp = require('gulp');

// Include plugins
var plugins = require('gulp-load-plugins')(); // tous les plugins de package.json

// Variables de chemins
var source = '.'; // dossier de travail
var destination = '.'; // dossier à livrer

// Tâche "build" = SASS + autoprefixer + CSScomb + beautify (source -> destination)
gulp.task('css', function () {
  return gulp.src(source + '/public/stylesheets/knacss.scss')
    .pipe(plugins.sass())
    .pipe(plugins.csscomb())
    .pipe(plugins.cssbeautify({indent: '  '}))
    .pipe(plugins.autoprefixer())
    .pipe(gulp.dest(destination + '/public/stylesheets/'));
});

// Tâche "minify" = minification CSS (destination -> destination)
gulp.task('minify', function () {
  return gulp.src(destination + '/public/stylesheets/knacss.css')
    .pipe(plugins.csso())
    .pipe(plugins.rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(destination + '/public/stylesheets/'));
});

gulp.task('nodemon', function (cb) {
	
	var started = false;
	
	return plugins.nodemon({
		script: './bin/www'
	}).on('start', function () {
		// to avoid nodemon being started multiple times
		// thanks @matthisk
		if (!started) {
			cb();
			started = true; 
		} 
	});
});


// Tâche "build"
gulp.task('build', ['css','minify']);

// Tâche "prod" = Build + minify
gulp.task('prod', ['build',  'minify']);

// Tâche "watch" = je surveille *less
gulp.task('watch', function () {
  gulp.watch(source + '/public/stylesheets/*.scss', ['build']);
});

// Tâche par défaut
gulp.task('default', ['build']);

// Tâche par défaut
gulp.task('dev', ['watch','nodemon']);
