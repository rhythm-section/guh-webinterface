/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                                                                                     *
 * Copyright (C) 2015 Lukas Mayerhofer <lukas.mayerhofer@guh.guru>                     *
 *                                                                                     *
 * Permission is hereby granted, free of charge, to any person obtaining a copy        *
 * of this software and associated documentation files (the "Software"), to deal       *
 * in the Software without restriction, including without limitation the rights        *
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell           *
 * copies of the Software, and to permit persons to whom the Software is               *
 * furnished to do so, subject to the following conditions:                            *
 *                                                                                     *
 * The above copyright notice and this permission notice shall be included in all      *
 * copies or substantial portions of the Software.                                     *
 *                                                                                     *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR          *
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,            *
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE         *
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER              *
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,       *
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE       *
 * SOFTWARE.                                                                           *
 *                                                                                     *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


/*
 * Plugins
 */

var gulp = require('gulp');
var plumber = require('gulp-plumber');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename');
var size = require('gulp-size');


/*
 * Configuration
 */

var pathConfig = require('../config/gulp').paths;
var sassConfig = require('../config/gulp').sass;
var minifyCssConfig = require('../config/gulp').minifyCss;
var renameConfig = require('../config/gulp').rename;
var sizeConfig = require('../config/gulp').size;


/*
 * Pipe
 */

module.exports = {
  getPipe: function() {
    return gulp.src(pathConfig.styles)
      .pipe(plumber())
      .pipe(sourcemaps.init())
        .pipe(sass(sassConfig))
        .pipe(size(sizeConfig))
        .pipe(minifyCss(minifyCssConfig))
        .pipe(size(sizeConfig))
        .pipe(rename(renameConfig))
      .pipe(sourcemaps.write('./maps'))
      .pipe(gulp.dest(pathConfig.dest.production));
  }
};
