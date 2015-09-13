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
var browserSync = require('browser-sync').create('app-server');
var runSequence = require('run-sequence');
var argsParser = require('../utils/args-parser');
var logger = require('../utils/logger');


/*
 * Task
 */

gulp.task('development', function(done) {
  // Setting node envrionment
  process.env.NODE_ENV = 'development';

  runSequence(
    'copy-assets-development',
    'build-ui-svg-sprites',
    'build-vendor-svg-sprites',
    [
      'build-templates-development',
      'build-vendor-styles-development',
      'build-app-styles-development',
      'build-vendor-scripts-development',
      'build-app-scripts-development',
      'document-app-scripts-development'
    ],
    'build-index-development',
    argsParser.isDocumentationServer() ? 'documentation-server-development' : 'noop',
    argsParser.isServer() ? 'app-server-development' : 'noop',
    argsParser.isWatch() ? 'watch-development' : 'noop',
    done
  );
});
