'use strict';

const gulp = require('gulp');
const concat = require('gulp-concat');
const minify = require('gulp-minify');
const rename = require('gulp-rename');
const clean = require('gulp-clean');

// concat js files
gulp.task('concat-scripts', () => {

    return gulp.src(['./js/**/*.js'])
        .pipe(concat('all.js'))
        .pipe(gulp.dest('./dist/'));
});

// minify the js files -- waits for concat-scripts to complete
gulp.task('minify-js', ['concat-scripts'], () => {

    return gulp.src(['./dist/*.js'])
        .pipe(minify({ ignoreFiles: ['all-min.js', 'all.min.js'] }))
        .pipe(gulp.dest('./dist/'));
});

// rename the output file all-min.js to all.min.js
gulp.task('rename-js', ['minify-js'], () => {

    return gulp.src('./dist/all-min.js')
        .pipe(rename('all.min.js'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('scripts', ['rename-js'], () => {

    return gulp.src(['./dist/all.js', './dist/all-min.js'])
        .pipe(clean());

});