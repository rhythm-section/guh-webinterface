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
var del = require('del');
var logger = require('../utils/logger');


/*
 * Configuration
 */

var pathConfig = require('../config/gulp').paths;
var cleanConfig = require('../config/gulp').clean;


/*
 * Methods
 */

// Get pretty print version from array
var getPrettyFromArray = function(array) {
  return array.join('\n');
};

// Get pretty print version from object
var getPrettyFromObject = function(object) {
  var array = Object.keys(object).map(function(key) {
    return object[key];
  });

  return getPrettyFromArray(array);
};


/*
 * Task
 * Removes folders of previous runs
 */

gulp.task('clean', function(done) {
  del(
    // Patterns
    [
      pathConfig.docs.development,
      pathConfig.docs.production,
      pathConfig.dest.development,
      pathConfig.dest.production
    ],

    // Options
    cleanConfig,

    // Callback
    function(error, paths) {
      if(error) {
        logger.error(error);
      } else if(paths.length > 0) {
        logger.info('Successful deleted folder:\n' + getPrettyFromArray(paths));
      } else {
        logger.warn('There was nothing to delete. Wanted to delete:\n' + getPrettyFromObject(pathConfig.dest));
      }
      done();
    });
});
