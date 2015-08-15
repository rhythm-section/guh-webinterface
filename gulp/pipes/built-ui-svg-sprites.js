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
var svgSprite = require('gulp-svg-sprite');
var gulpIgnore = require('gulp-ignore');
var size = require('gulp-size');


/*
 * Configuration
 */

var pathConfig = require('../config/gulp').paths;
var svgSpriteConfig = require('../config/gulp').svgSprite;
var sizeConfig = require('../config/gulp').size;


/*
 * Pipes
 */


/*
 * Pipe
 */

module.exports = {
  getPipe: function() {
    // Set output filepath + filename for css-files
    svgSpriteConfig.mode.css.dest = 'assets/css/ui';
    svgSpriteConfig.mode.symbol.dest = 'assets/svg/ui';

    // Set prefix
    svgSpriteConfig.mode.css.prefix = '.ui-%s';

    // Set output filepath + filename
    svgSpriteConfig.mode.css.sprite = '../../svg/ui.css.svg';
    svgSpriteConfig.mode.symbol.sprite = '../ui/ui.symbol.svg';

    return gulp.src(pathConfig.svg.ui)
      .pipe(plumber())
      .pipe(svgSprite(svgSpriteConfig))
      .pipe(size(sizeConfig));
  }
};
