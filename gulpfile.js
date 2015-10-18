var gulp = require('gulp'),
	wiredep = require('wiredep').stream,
	browserSync = require('browser-sync').create(),
	sass = require('gulp-sass'),
	useref = require('gulp-useref'),
    gulpif = require('gulp-if'),
    uglify = require('gulp-uglify'),
    minifyCss = require('gulp-minify-css'),
    clean = require('gulp-clean');

//Browser-sync
// Static server
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./dist"
        }
    });
});

//Clean 
gulp.task('clean', function () {
    return gulp.src('dist', {read: false})
        .pipe(clean());
});

//Build 
gulp.task('build', ['clean'], function () {
    var assets = useref.assets();
 
    return gulp.src('app/*.html')
        .pipe(assets)
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', minifyCss()))
        .pipe(assets.restore())
        .pipe(useref())
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.stream());
});

//Sass 
gulp.task('sass', function () {
  gulp.src('app/sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('app/css'));
});

//Images
gulp.task('images',['build'], function (){
	gulp.src('app/img/*')
		.pipe(gulp.dest('./dist/img'));
});

//Fonts
gulp.task('fonts',['build'], function (){
	gulp.src('app/fonts/**/*')
		.pipe(gulp.dest('./dist/fonts'));
});

//Bower
gulp.task('bower', function () {
  gulp.src('./app/index.html')
    .pipe(wiredep({
      directory : "app/bower_components"
    }))
    .pipe(gulp.dest('./app'));
});

//Watch
gulp.task('watch', function () {
	gulp.watch('bower.json', ['bower', 'build']);
	gulp.watch('app/sass/**/*.scss', ['sass', 'build']);
	gulp.watch('app/*.html', ['build']);
	gulp.watch('app/js/*.js', ['build']);
});

//Default task
gulp.task('default', ['sass', 'bower', 'build', 'images', 'fonts', 'browser-sync', 'watch']);