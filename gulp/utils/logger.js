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

var colors = require('colors');


/*
 * Configuration
 */

var colorConfig = require('../config/gulp').colors;

// Set color theme
colorDefinitions = {
  debug: 'blue',
  error: 'red',
  info: 'green',
  warn: 'yellow'
};
colors.setTheme(colorDefinitions);


/*
 * Methods
 */

var getLine = function(message, character, padding) {
  var i = 0;
  var length = message.length + padding;
  var line = '';

  for(i; i < length; i++) {
    line = line + character;
  }

  return line;
};

var debug = function(message) {
  console.log(colors.debug(message));
};

var error = function(message) {
  console.log(colors.error(message));
};

var info = function(message) {
  // console.log('\n');
  console.log(colors.info(message));
  // console.log(colors.info(getLine(message, '-', 1)));
};

var warn = function(message) {
  console.log(colors.warn(message));
};


/*
 * Module
 */

module.exports = {
  debug: debug,
  error: error,
  info: info,
  warn: warn
};
