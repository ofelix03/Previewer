var gulp = require('gulp');
var jsmin = require('gulp-jsmin');
var rename = require('gulp-rename');
var cleanCSS = require('gulp-clean-css');
 
gulp.task('default', ['js-minify', 'css-minify']);

gulp.task('js-minify', function () {
	gulp.src('src/*.js')
		.pipe(jsmin())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('dist'));
});

gulp.task('css-minify', function () {
	gulp.src('src/*.css')
		.pipe(cleanCSS({compatibility: 'ie8'}))
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('dist'));
});