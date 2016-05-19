var path = require('path');
var gulp = require('gulp');
var browserify = require('browserify');
var watchify = require('watchify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');

var folders = ['basic', 'midi-io', 'midi-recording', 'midifile', 'create_instruments']
var currentFolder = 'instruments'

gulp.task('watch', function () {
  return watchify({entries: [currentFolder], extensions: ['.js'], debug: true})
    .transform(babelify)
    .bundle()
    .pipe(source('build.js'))
    .pipe(gulp.dest(currentFolder));
});

gulp.task('build-all', function () {

  folders.map(function(folder) {
    console.log(folder)
    browserify({entries: [folder], extensions: ['.js'], debug: true})
      .transform(babelify)
      .bundle()
      .pipe(source('build.js'))
      .pipe(gulp.dest(folder));

  })
});

/*
gulp.task('watch', ['build'], function () {
  // folders.map(function(folder) {
  //   gulp.watch(path.join(folder, '*.js'), ['build']);
  // })
  gulp.watch('../../src/*.js', ['build'])
  gulp.watch(path.join(currentFolder, 'index.js'), ['build'])
});
*/

gulp.task('default', ['watch']);


//https://github.com/gulpjs/gulp/blob/master/docs/recipes/fast-browserify-builds-with-watchify.md

