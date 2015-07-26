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
var inject = require('gulp-inject');


/*
 * Pipes
 */

var builtStylesProduction = require('../pipes/built-styles-production');
var builtAppScriptsProduction = require('../pipes/built-app-scripts-production');
var builtVendorScriptsProduction = require('../pipes/built-vendor-scripts-production');
var validatedIndex = require('../pipes/validated-index');


/*
 * Configuration
 */

var pathConfig = require('../config/gulp').paths;
var injectConfig = require('../config/gulp').inject;


/*
 * Pipe
 */

module.exports = {
  getPipe: function() {
    var stylesPipe = builtStylesProduction.getPipe();
    var vendorScriptsPipe = builtVendorScriptsProduction.getPipe();
    var appScriptsPipe = builtAppScriptsProduction.getPipe();

    return validatedIndex.getPipe()
      // Write first to get relative path for inject
      .pipe(gulp.dest(pathConfig.dest.production))
      .pipe(inject(stylesPipe, injectConfig.app))
      .pipe(inject(vendorScriptsPipe, injectConfig.vendor))
      .pipe(inject(appScriptsPipe, injectConfig.app))
      .pipe(gulp.dest(pathConfig.dest.production));
  }
};
