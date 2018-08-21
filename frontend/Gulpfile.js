var gulp = require('gulp');
var sass = require('gulp-sass');
//var fontAwesome = require('node-font-awesome');

gulp.task('build', ['sass', 'images', 'fonts', 'js']);

gulp.task('sass', function() {
  	return gulp.src('app/scss/**/*.scss')
    	.pipe(sass())
    	.pipe(gulp.dest('../app/src/main/resources/site/assets/css'));
});

gulp.task('images', function(){
	return gulp.src('app/images/**/*')
		.pipe(gulp.dest('../app/src/main/resources/site/assets/images'));
});

gulp.task('js', function(){
	return gulp.src('app/js/**/*')
		.pipe(gulp.dest('../app/src/main/resources/site/assets/js'));
});

gulp.task('fonts', function(){
	return gulp.src('app/fonts/**/*')
		.pipe(gulp.dest('../app/src/main/resources/site/assets/fonts'));
});

/*gulp.task('fontawesome', function() {
  gulp.src(fontAwesome.fonts)
    .pipe(gulp.dest('../app/src/main/resources/site/assets/fonts'));
});*/

gulp.task('watch', function(){
	gulp.watch('app/**/*', ['build']);
});
