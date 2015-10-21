var gulp = require('gulp'),
    wiredep = require('wiredep').stream,
    browserSync = require('browser-sync').create(),
    autoprefixer = require('gulp-autoprefixer'),
    sourcemaps = require('gulp-sourcemaps'),
    imageop = require('gulp-image-optimization'),
    cache = require('gulp-cache'),
    runSequence = require('run-sequence'),
    sass = require('gulp-sass'),
    jade = require('gulp-jade'),
    useref = require('gulp-useref'),
    gulpif = require('gulp-if'),
    uglify = require('gulp-uglify'),
    minifyCss = require('gulp-minify-css'),
    clean = require('gulp-clean'),
    reload = browserSync.reload;

//Browser-sync server
gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: "app"
  }
});
});

//Sass 
gulp.task('sass', function () {
  gulp.src('app/scss/**/*.scss')
  .pipe(sourcemaps.init())
  .pipe(sass().on('error', sass.logError))
  .pipe(autoprefixer({
    browsers: ['last 2 versions']
}))
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('app/css'))
  .pipe(reload({stream: true}));
});

//Jade
gulp.task('jade', function() {
  return gulp.src('app/*.jade')
  .pipe(jade({
    pretty: true
}))
  .pipe(gulp.dest('app'))
  .pipe(reload({stream: true}));
});

gulp.task('jade-watch', ['jade'], reload);

//Bower
gulp.task('bower', function () {
  gulp.src('app/**/*.jade')
  .pipe(wiredep({
    directory : "app/bower_components"
}))
  .pipe(gulp.dest('app'));
});

// Watchers
gulp.task('watch', function() {
  gulp.watch('bower.json', ['bower']);
  gulp.watch('app/scss/**/*.scss', ['sass']);
  gulp.watch('app/**/*.jade', ['jade-watch']); 
  gulp.watch('app/scripts/**/*.js').on('change', browserSync.reload);
});

// Optimization
//-------------

//CSS and JavaScript 
gulp.task('useref', function() {
  var assets = useref.assets();

  return gulp.src('app/*.html')
  .pipe(assets)
  .pipe(gulpif('*.css', minifyCss()))
  .pipe(gulpif('*.js', uglify()))
  .pipe(assets.restore())
  .pipe(useref())
  .pipe(gulp.dest('dist'))
});

//Images 
gulp.task('images', function(cb) {
  gulp.src(['app/images/**/*.png','app/images/**/*.jpg','app/images/**/*.gif','app/images/**/*.jpeg']).pipe(cache(imageop({
    optimizationLevel: 5,
    progressive: true,
    interlaced: true
}))).pipe(gulp.dest('dist/images')).on('end', cb).on('error', cb);
});

// Copying fonts 
gulp.task('fonts', function() {
  return gulp.src('app/fonts/**/*')
  .pipe(gulp.dest('dist/fonts'))
});

//Clean 
gulp.task('clean', function (callback) {
  gulp.src('dist', {read: false})
  .pipe(clean());
  return cache.clearAll(callback);
});

gulp.task('clean:dist', function(callback) {
  gulp.src(['dist/**/*', '!dist/images', '!dist/images/**/*'], callback)
  .pipe(clean());
});

// Build
// ---------------

gulp.task('default', function(callback) {
  runSequence( 'bower', 
     ['sass', 'jade', 'browserSync', 'watch'],
     callback
     )
});

gulp.task('build', function(callback) {
  runSequence('clean:dist', ['sass', 'jade'],  
    ['useref', 'images', 'fonts'],
    callback
    )
});