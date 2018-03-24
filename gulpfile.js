'use strict';

const gulp = require('gulp');
const concat = require('gulp-concat');
const minify = require('gulp-minify');
const rename = require('gulp-rename');
const clean = require('gulp-clean');
const sass = require('gulp-sass');

// ----- JavaScript files

// concat js files
gulp.task('concat-scripts', () => {

    return gulp.src(['./js/**/*.js'])
        .pipe(concat('all.js'))
        .pipe(gulp.dest('./dist/scripts/'));
});

// minify the js files -- waits for concat-scripts to complete
gulp.task('minify-js', ['concat-scripts'], () => {

    return gulp.src(['./dist/scripts/*.js'])
        .pipe(minify({ ignoreFiles: ['all-min.js', 'all.min.js'] }))
        // exclude these files if they are still left in the folder by accident
        .pipe(gulp.dest('./dist//scripts/'));
});

// rename the output file all-min.js to all.min.js
gulp.task('rename-js', ['minify-js'], () => {

    return gulp.src('./dist/scripts/all-min.js')
        .pipe(rename('all.min.js'))
        .pipe(gulp.dest('./dist/scripts/'));
});

// gulp scripts will run 
gulp.task('scripts', ['rename-js'], () => {

    return gulp.src(['./dist/scripts/all.js', './dist/scripts/all-min.js'])
        .pipe(clean()); // remove all.js and all-min.js

});

// ------ CSS files