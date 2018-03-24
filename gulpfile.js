'use strict';

const gulp = require('gulp');
const concat = require('gulp-concat');

gulp.task('scripts', () => {

    return gulp.src(['./js/**/*.js'])
        .pipe(concat('all.js'))
        .pipe(gulp.dest('./dist/'));

});