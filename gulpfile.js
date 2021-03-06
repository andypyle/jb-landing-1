/// ### REQUIRE DEPENDENCIES
var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    sass = require('gulp-sass'),
    imagemin = require('gulp-imagemin'),
    browserify = require('browserify'),
    watchify = require('watchify'),
    gutil = require('gulp-util'),
    sourcemaps = require('gulp-sourcemaps'),
    assign = require('lodash.assign'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    jade = require('gulp-jade'),
    prefix = require('gulp-autoprefixer'),
    minifyCSS = require('gulp-minify-css'),
    browserSync = require('browser-sync').create();

/// ### OPTIONS
var sources = {
  'sass':{
    'in':'./src/sass/style.sass',
    'out':'./src/site/styles/',
    'opts':{
      'outputStyle': 'expanded'
    }
  },
  'jade':{
    'in':'./src/jade/**/!(_)*.jade',
    'out':'./src/site',
    'opts':{
      'locals': {},
      'pretty': '\t'
    }
  },
  'js':{
    'in':'./src/js/app.js',
    'out':'./src/site/js'
  },
  'img':{
    'in':'./src/img/**/*',
    'out':'./src/site/img'
  },
  'build':{
    'css':'./build/styles',
    'js':'./build/js',
    'html':'./build',
    'img':'./build/img'
  }
};


/// ### BROWSER-SYNC
gulp.task('browsersync', function(){
    browserSync.init({
        server: './src/site',
        notify: false,
        open: false,
        injectChanges: true
    });

    gulp.watch('./src/sass/**/*.sass', ['sass']);
    gulp.watch('./src/jade/**/*.jade', ['jade']);
    gulp.watch(['./src/site/*.html']).on('change', browserSync.reload);
});


/// ### SASS
gulp.task('sass', function(){
    gulp.src(sources.sass.in)
    .pipe(sass(sources.sass.opts)
    .on('error', sass.logError))
    .pipe(prefix({
        browsers: [
            '> 1%',
            'last 2 versions',
            'firefox >= 4',
            'safari 7',
            'safari 8',
            'IE 8',
            'IE 9',
            'IE 10',
            'IE 11'
            ],
        cascade: true
    }))
    .pipe(rename('style.css'))
    .pipe(gulp.dest(sources.sass.out))
    .pipe(minifyCSS())
    .pipe(concat('style.min.css'))
    .pipe(gulp.dest(sources.sass.out))
    .pipe(gulp.dest(sources.build.css))
    .pipe(browserSync.stream({match: '**/*.css'}));
});


/// ### JADE
gulp.task('jade', function(){
    gulp.src(sources.jade.in)
        .pipe(jade(sources.jade.opts))
        .pipe(gulp.dest(sources.jade.out))
    .pipe(gulp.dest(sources.build.html))
});


/// ### JAVASCRIPT
// Browserify options.
var jsOptions = {
    entries: ['./src/js/app.js'],
    debug: true
};

var opts = assign({}, watchify.args, jsOptions);

var b = watchify(browserify(opts));

// 'gulp scripts' task to build scripts
gulp.task('scripts', bundle);
b.on('update', bundle);
b.on('log', gutil.log);

// bundle() function for js bundling
function bundle(){
    return b.bundle()
        .on('error', gutil.log.bind(gutil, 'Browserify error.'))
        .pipe(source('scripts.js'))
        .pipe(buffer())
        .pipe(gulp.dest(sources.js.out))
        .pipe(uglify())
        .on('error', gutil.log)
        .pipe(rename('scripts.min.js'))        
        .pipe(gulp.dest(sources.build.js))
        .pipe(browserSync.reload({stream:true, once: true}));
};


/// ### JS LINTING
gulp.task('jshint', function() {
    return gulp.src(sources.js.in)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});


/// ### IMAGE OPTIMIZE
gulp.task('images', function() {
    gulp.src(sources.img.in)
        .pipe(imagemin())
        .pipe(gulp.dest(sources.build.img))
        .pipe(gulp.dest(sources.img.out));
});


/// ### BUILD
gulp.task('build', ['jshint', 'scripts', 'sass', 'images', 'jade']);


/// ### DEFAULT TASK
gulp.task('default', ['browsersync','images','sass','jade','scripts']);
