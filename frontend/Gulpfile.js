var gulp = require('gulp');
var sass = require('gulp-sass');
//var fontAwesome = require('node-font-awesome');
var iconfont = require('gulp-iconfont');
var iconfontCss = require('gulp-iconfont-css');
var gulpSequence = require('gulp-sequence')

var fontName = 'iconfont';

gulp.task('build',  function(callback) {
	gulpSequence(['sass', 'images', 'fonts', 'js'], 'copy')(callback)
});

gulp.task('sass', function() {
	return gulp.src('app/scss/**/*.scss')
		.pipe(sass())
		.pipe(gulp.dest('build/css'));
});

gulp.task('images', function(){
	return gulp.src('app/images/**/*')
		.pipe(gulp.dest('build/images'));
});

gulp.task('js', function(){
	return gulp.src('app/js/**/*')
		.pipe(gulp.dest('build/js'));
});

gulp.task('fonts', function(){
	return gulp.src('app/fonts/**/*')
		.pipe(gulp.dest('build/fonts'));
});

gulp.task('copy', function(){
	return gulp
    .src('build/**/*')
    .pipe(gulp.dest('../app/src/main/resources/assets'))
});

/*gulp.task('fontawesome', function() {
  gulp.src(fontAwesome.fonts)
	.pipe(gulp.dest('build/fonts'));
});*/

gulp.task('iconfont', function(){
	return gulp.src(['app/icons/*.svg'])
	.pipe(iconfontCss({
		fontName: fontName,
		path: 'app/scss/base/_iconfont_template.scss',
		targetPath: '../scss/base/_iconfont.scss',
		fontPath: '../fonts/',
		firstGlyph: 0xf120 // Codes for glyphs should be in area where are no icons by default on iOS and Android
	}))
	.pipe(iconfont({
		fontName: fontName,
		formats: ['ttf', 'woff', 'woff2'],
		fontHeight: 1001,
		normalize: true
	}))
	.pipe(gulp.dest('app/fonts'));
});

gulp.task('watch', function(){
	gulp.watch('app/**/*', ['build']);
});
