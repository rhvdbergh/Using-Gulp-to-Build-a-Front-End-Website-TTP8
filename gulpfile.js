// Treehouse Techdegree Project 8: Using Gulp to Build a Front End Website

// Ronald van der Bergh

// I am aiming for an "exceeds expectations" grade

// This project takes starter files provided by Treehouse and uses gulp 
// to build a deployment-ready website. The following criteria are met:

// JavaScript files are concatenated and minified. 
// SCSS files are converted to CSS and minified. 
// Source map files for JavaScript and CSS are created. 
// JPEG or PNG files are compressed.

// The app outputs to a dist folder, ready for deployment.

// For extra credit, the app watches for changes to SCSS files 
// when the default gulp command is run. Changes to SCSS files will 
// result in the command gulp styles to be run and the files are compiled,
// concatenated, minified, and saved in the dist folder. 
// The webpage automatically refreshes and displays the changes 
// in the browser.

'use strict';

const gulp = require('gulp');
const concat = require('gulp-concat');
const minify = require('gulp-minify');
const rename = require('gulp-rename');
const clean = require('gulp-clean');
const sass = require('gulp-sass');
const csso = require('gulp-csso');
const sourcemaps = require('gulp-sourcemaps');
const imagemin = require('gulp-imagemin'); // image optimizer
const runSequence = require('run-sequence'); // easy way to combine sync and async tasks
// run-sequence will help with making sure that clean runs before the build
const replace = require('gulp-replace'); // fixes paths and file names in the final build index.html
const insert = require('gulp-insert');
const connect = require('gulp-connect'); // server; uses livereload to load pages on the fly when scss files change

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
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(concat('all.min.js')) // actually not minified yet, but helpful for sourcemaps to already have .min. name
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist/scripts/'));
});

// minify the js files -- waits for concat-scripts to complete
gulp.task('minify-js', ['concat-scripts'], () => {

    return gulp.src(['./dist/scripts/*.js'])
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(minify())
        // exclude these files if they are still left in the folder by accident
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist/scripts/'));
});

// rename the output file all-min.js to all.min.js
gulp.task('rename-js', ['minify-js'], () => {

    return gulp.src('./dist/scripts/all.min-min.js')
        .pipe(rename('all.min.js'))
        .pipe(gulp.dest('./dist/scripts/'));
});

// gulp scripts will run concat-js, minify-js, rename the file, and delete temporary files
gulp.task('scripts', ['rename-js'], () => {

    return gulp.src(['./dist/scripts/all.min.js.map', './dist/scripts/all.min-min.js'])
        .pipe(clean()); // remove extra files
});

// ------ CSS task files

// compiles sass to css into css folder
gulp.task('compilesass', () => {

    return gulp.src('./sass/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(rename('all.min.css'))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./css/'));
});

// concatenate css files (should there be more than one!)
gulp.task('concat-css', ['compilesass'], () => {

    return gulp.src('./css/**/*.css')
        .pipe(concat('all.min.css'))
        .pipe(gulp.dest('./css/'))
});

// minify css
gulp.task('styles', ['concat-css'], () => {

    return gulp.src('./css/all.min.css')
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(csso({ sourceMap: true }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist/styles/'));
});

// ----- image files

// optimize jpg and png files and save to dist/images folder
gulp.task('images', () => {

    return gulp.src('./images/**')
        .pipe(imagemin())
        .pipe(gulp.dest('./dist/content/'));
});

// ----- icon files

// this simply copies the icon files into the dist/icons folder
gulp.task('icons', () => {

    gulp.src('./icons/**')
        .pipe(gulp.dest('./dist/icons'));
});

// ----- html files

// copy all html to dist folder
gulp.task('html', () => {

    gulp.src('./*.html')
        .pipe(gulp.dest('./dist/'));
})

// ----- web server
gulp.task('serve', () => {

    return connect.server({
        root: './dist/',
        port: 3000,
        livereload: true
    })
});

// ----- watch

// reloads the browser after compiling css
gulp.task('reload', ['styles'], () => {

    return gulp.src('./dist/index.html')
        .pipe(gulp.dest('./dist'))
        .pipe(connect.reload());
});

// watches for changes to SCSS files
// it will then run the styles task
gulp.task('watch', () => {

    gulp.watch('./sass/**/*.scss', ['reload']);
});

// ----- build and default

// changes the references in the final build index.html to 
// the correct, renamed resources
gulp.task('fixFileNames', () => {

    return gulp.src('./dist/index.html')
        .pipe(replace('css/global.css', 'styles/all.min.css'))
        .pipe(replace('js/global.js', 'scripts/all.min.js'))
        .pipe(replace('images', 'content'))
        .pipe(gulp.dest('./dist/'));
});

// build the project, but first clean
gulp.task('build', ['clean'], () => {

    // the first set of tasks will be run asynchronously, then the index.html will be changed, then the server will run
    return runSequence(['scripts', 'styles', 'images', 'icons', 'html'], ['fixFileNames']);
});

gulp.task('default', ['build'], () => {

    return runSequence('serve', 'watch');
});