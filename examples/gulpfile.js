var fs = require('fs')
var path = require('path')
var browserify = require('browserify')
var watchify = require('watchify')
var babelify = require('babelify')
var gulp = require('gulp')
var gutil = require('gulp-util')
var es = require('event-stream')
var source = require('vinyl-source-stream')
var buffer = require('vinyl-buffer')
var args = process.argv
var argv = require('yargs').argv;

function getFolders(dir) {
  return fs.readdirSync(dir)
    .filter(function(file) {
      return fs.statSync(path.join(dir, file)).isDirectory() && file !== 'css' && file !== 'js' && file !== 'data' && file !== 'node_modules' && file !== 'lib'
    })
}

gulp.task('folders', function(){
  console.log(getFolders('./'))
})

/*
gulp.task('watch', function(done) {
  var folders = getFolders('./')
  var tasks = folders.map(function(folder){
    var b = browserify({
      entries: [folder],
      extensions: ['.js'],
      debug: true,
      cache: {},
      packageCache: {},
      fullPaths: true
    })
    .transform(babelify)
    .plugin(watchify);

    var bundle = function(){
      return b.bundle()
        .pipe(source(folder))
        .pipe(buffer())
        .pipe(gulp.dest(folder));
    }

    b.on('update', bundle);
    return bundle();
  })
  es.merge(tasks).on('end', done)
})


gulp.task('watch1', function () {
  var folders = getFolders('./')
  return folders.map(function(folder){
    //console.log(folder)
    watchify(browserify({
      entries: [folder],
      extensions: ['.js'],
      debug: true
    }))
    .transform(babelify)
    .on('log', gutil.log)
    .on('update', function(){
      this.bundle()
      .pipe(source('build.js'))
      .pipe(gulp.dest(folder))
    })
  })
})

function bundle(b, folder){
  console.log(b)
  b.bundle()
}
*/

gulp.task('build-all', function(){
  var folders = getFolders('./')
  folders.map(function(folder) {
    console.log(folder)
    return browserify({entries: [folder], extensions: ['.js'], debug: true})
      .transform(babelify)
      .bundle()
      .pipe(source('build.js'))
      .pipe(gulp.dest(folder));
  })
})

/*
gulp.task('build', function(){

})

gulp.task('watch', ['build'], function () {
  var folders = getFolders('./')
  folders.map(function(folder) {
    gulp.watch(path.join(folder, '*.js'), ['build']);
  })
  //gulp.watch('../../src/*.js', ['build'])
  //gulp.watch(path.join(currentFolder, 'index.js'), ['build'])
})
*/

gulp.task('watch', bundle)

var folder = argv.d
var b = watchify(browserify({
  entries: [folder],
  extensions: ['.js'],
  debug: true
}))
.transform(babelify)
.on('log', gutil.log)
.on('update', bundle)


function bundle(){
  console.log(folder)
  return b.bundle()
  .pipe(source('build.js'))
  .pipe(gulp.dest(folder))
}

//gulp.task('default', ['watch'])


//https://github.com/gulpjs/gulp/blob/master/docs/recipes/fast-browserify-builds-with-watchify.md

