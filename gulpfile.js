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
const uglify = require('gulp-uglify');
const gulpif = require('gulp-if');
const lazypipe = require('lazypipe');
const rename = require('gulp-rename');
const clean = require('gulp-clean');
const sass = require('gulp-sass');
const cleanCSS = require('gulp-clean-css'); // to minify CSS
const sourcemaps = require('gulp-sourcemaps');
const imagemin = require('gulp-imagemin'); // image optimizer
const replace = require('gulp-replace'); // to replace references to "images" folder with "content"
const useref = require('gulp-useref');
const runSequence = require('run-sequence'); // easy way to combine sync and async tasks
// run-sequence will help with making sure that clean runs before the build
const connect = require('gulp-connect'); // server

// ----- general utility tasks

// deletes the dist/ folder with all files
gulp.task('clean', () => {
    return gulp.src('./dist/')
        .pipe(clean());
});

// ----- JavaScript file tasks

// concat js files
// gulp.task('concat-scripts', () => {
//     return gulp.src(['./js/**/*.js'])
//         .pipe(sourcemaps.init())
//         .pipe(concat('all.min.js')) // actually not minified yet, but helpful for sourcemaps to already have .min. name
//         .pipe(sourcemaps.write('./'))
//         .pipe(gulp.dest('./dist/scripts/'));
// });

// // minify the js files -- waits for concat-scripts to complete
// gulp.task('minify-js', ['concat-scripts'], () => {

//     return gulp.src(['./dist/scripts/*.js'])
//         .pipe(minify({ ignoreFiles: ['all.min-min.js', 'all.min.js'] }))
//         // exclude these files if they are still left in the folder by accident
//         .pipe(gulp.dest('./dist/scripts/'));
// });

// // rename the output file all-min.js to all.min.js
// gulp.task('rename-js', ['minify-js'], () => {

//     return gulp.src('./dist/scripts/all-min.js')
//         .pipe(rename('all.min.js'))
//         .pipe(gulp.dest('./dist/scripts/'));
// });

// ------ CSS task files

// compiles sass to css into a temp folder
gulp.task('compilesass', () => {

    return gulp.src('./sass/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        // .pipe(rename('all.min.css'))
        .pipe(sourcemaps.write('../dist/styles/'))
        .pipe(gulp.dest('css'));
});

// concatenate css files (should there be more than one!)
gulp.task('concat-css', ['compilesass'], () => {

    return gulp.src('./tempcss/**/*.css')
        .pipe(concat('all.min.css'))
        .pipe(gulp.dest('css'))
});

// minify css
gulp.task('minify-css', ['concat-css'], () => {

    return gulp.src('./tempcss/all.min.css')
        .pipe(cleanCSS())
        .pipe(gulp.dest('./dist/styles/'));
});

// gulp styles will compile SCSS files into CSS, concat, minify and delete tempcss folder
gulp.task('styles', ['minify-css'], () => {

    return gulp.src(['css', './dist/styles/global.css.map'])
        .pipe(clean()); // delete the tempcss directory
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
        port: 3000
    })

});

// ----- build and default

// buildref builds the html with references, concatenates, minifies, 
// and copies .js and .css files to the dist folder
gulp.task('buildref', ['clean'], () => {

    return gulp.src('./index.html')
        .pipe(useref({}, lazypipe().pipe(sourcemaps.init, { loadMaps: true })))
        .pipe(gulpif("*.js", uglify()))
        .pipe(gulpif("*.css", cleanCSS()))
        .pipe(sourcemaps.write('maps'))
        .pipe(gulp.dest('./dist/'));
});

// replaces references to images/ with references to content/ in the 
// index.html file for final build
// assumes that the index.html file exists in dist/ folder
gulp.task('replaceImageFolder', () => {

    return gulp.src('dist/index.html')
        .pipe(replace('images', 'content'))
        .pipe(gulp.dest('dist'));
});

// build the project, then replace "images" folder with "content" for final build 
// then copy images, icons and serve on a local webserver
gulp.task('build', ['buildref'], () => {

    // the first set of tasks will be run asynchronously, then the server will run
    return runSequence(['replaceImageFolder', 'images', 'icons'], 'serve');
});

gulp.task('default', ['build']);