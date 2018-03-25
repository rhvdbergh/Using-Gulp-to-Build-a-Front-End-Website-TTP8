'use strict';

const gulp = require('gulp');
const concat = require('gulp-concat');
const minify = require('gulp-minify');
const rename = require('gulp-rename');
const clean = require('gulp-clean');
const sass = require('gulp-sass');
const cleanCSS = require('gulp-clean-css'); // to minify CSS
const sourcemaps = require('gulp-sourcemaps');

// ----- general utility tasks

// deletes the dist/ folder with all files
gulp.task('clean', () => {

    return gulp.src('./dist/')
        .pipe(clean());
});

// ----- JavaScript file tasks

// concat js files
gulp.task('concat-scripts', () => {

    return gulp.src(['./js/**/*.js'])
        .pipe(sourcemaps.init())
        .pipe(concat('all.min.js')) // actually not minified yet, but helpful for sourcemaps to already have .min. name
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist/scripts/'));
});

// minify the js files -- waits for concat-scripts to complete
gulp.task('minify-js', ['concat-scripts'], () => {

    return gulp.src(['./dist/scripts/*.js'])
        .pipe(minify({ ignoreFiles: ['all.min-min.js', 'all.min.js'] }))
        // exclude these files if they are still left in the folder by accident
        .pipe(gulp.dest('./dist/scripts/'));
});

// rename the output file all-min.js to all.min.js
gulp.task('rename-js', ['minify-js'], () => {

    return gulp.src('./dist/scripts/all-min.js')
        .pipe(rename('all.min.js'))
        .pipe(gulp.dest('./dist/scripts/'));
});

// gulp scripts will run concat-js, minify-js, rename the file, and delete temporary files
gulp.task('scripts', ['rename-js'], () => {

    return gulp.src(['./dist/scripts/all.js', './dist/scripts/all-min.js'])
        .pipe(clean()); // remove all.js and all-min.js

});

// ------ CSS task files

// compiles sass to css into a temp folder
gulp.task('compilesass', () => {

    return gulp.src('./sass/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.write('../dist/styles/'))
        .pipe(gulp.dest('./tempcss/'));
});

// rename the scss sourcemap file
gulp.task('rename-css-sourcemap', ['compilesass'], () => {

    return gulp.src('./dist/styles/global.css.map')
        .pipe(rename('all.min.css.map'))
        .pipe(gulp.dest('./dist/styles/'));
});

// concatenate css files (should there be more than one!)
gulp.task('concat-css', ['rename-css-sourcemap'], () => {

    return gulp.src('./tempcss/**/*.css')
        .pipe(concat('all.min.css'))
        .pipe(gulp.dest('./tempcss/'))
});

gulp.task('minify-css', ['concat-css'], () => {

    return gulp.src('./tempcss/all.min.css')
        .pipe(cleanCSS())
        .pipe(gulp.dest('./dist/styles/'));
});

// gulp styles will compile SCSS files into CSS, concat, minify and delete tempcss folder
gulp.task('styles', ['minify-css'], () => {

    return gulp.src(['./tempcss/', './dist/styles/global.css.map'])
        .pipe(clean()); // delete the tempcss directory
});