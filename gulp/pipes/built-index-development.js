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

var builtVendorStylesDevelopment = require('../pipes/built-vendor-styles-development');
var builtAppStylesDevelopment = require('../pipes/built-app-styles-development');
var orderedAppScripts = require('../pipes/ordered-app-scripts');
var orderedVendorScripts = require('../pipes/ordered-vendor-scripts');
var builtAppScriptsDevelopment = require('../pipes/built-app-scripts-development');
var builtVendorScriptsDevelopment = require('../pipes/built-vendor-scripts-development');
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
    var vendorStylesPipe = builtVendorStylesDevelopment.getPipe();
    var appStylesPipe = builtAppStylesDevelopment.getPipe();
    var orderedVendorScriptsPipe = builtVendorScriptsDevelopment.getPipe().pipe(orderedVendorScripts.getPipe());
    var orderedAppScriptsPipe = builtAppScriptsDevelopment.getPipe().pipe(orderedAppScripts.getPipe());

    return validatedIndex.getPipe()
      // Write first to get relative path for inject
      .pipe(gulp.dest(pathConfig.dest.development))
      .pipe(inject(vendorStylesPipe, injectConfig.vendor))
      .pipe(inject(appStylesPipe, injectConfig.app))
      .pipe(inject(orderedVendorScriptsPipe, injectConfig.vendor))
      .pipe(inject(orderedAppScriptsPipe, injectConfig.app))
      .pipe(gulp.dest(pathConfig.dest.development));
  }
};
