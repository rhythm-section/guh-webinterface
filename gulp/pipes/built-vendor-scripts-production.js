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
var ignore = require('gulp-ignore');
var mainBowerFiles = require('main-bower-files');
var argsParser = require('../utils/args-parser');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var size = require('gulp-size');
var sourcemaps = require('gulp-sourcemaps');


/*
 * Configuration
 */

var pathConfig = require('../config/gulp').paths;
var mainBowerFilesConfig = require('../config/gulp').mainBowerFiles.scripts;
var concatConfig = require('../config/gulp').concat;
var uglifyConfig = require('../config/gulp').uglify;
var renameConfig = require('../config/gulp').rename;
var sizeConfig = require('../config/gulp').size;


/*
 * Pipe
 */

module.exports = {
  getPipe: function() {
    var environment = argsParser.getEnvironment();

    if(environment === 'development') {
      mainBowerFilesConfig.includeDev = true;
    }

    return gulp.src(mainBowerFiles(mainBowerFilesConfig))
      .pipe(ignore.exclude('*.map'))
      .pipe(sourcemaps.init())
        .pipe(concat('vendor.js', concatConfig))
        .pipe(size(sizeConfig))
        .pipe(uglify(uglifyConfig))
        .pipe(size(sizeConfig))
        .pipe(rename(renameConfig))
      .pipe(sourcemaps.write('./maps'))
      .pipe(gulp.dest(pathConfig.libs.production));
  }
};
