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

var bourbon = require('node-bourbon');
var neat = require('node-neat');


/*
 * Configuration
 */

var config = './gulp/config';
var src = './src';
var developmentDest = './dist';
var productionDest = './dist';
var svgType = '';


module.exports = {
  // General
  paths: {
    src: src,
    dest: {
      development: developmentDest,
      production: productionDest
    },
    docs: {
      development: './docs',
      production: './docs'
    },

    fonts: src + '/assets/fonts/**/*',
    libs: {
      development: developmentDest + '/assets/libs',
      production: productionDest + '/assets/libs'
    },
    images: src + '/assets/img/**/*.{gif,jpg,jpeg,png}',
    index: src + '/index.html',
    templates: [src + '/**/*.html', '!' + src + '/index.html'],
    scripts: src + '/app/**/*.js',
    styles: src + '/app/app.scss',
    sass: [src + '/assets/scss/**/*.scss', src + '/app/**/*.scss'],
    svg: {
      vendor: src + '/assets/svg/vendor/*.svg',
      ui: src + '/assets/svg/ui/*.svg'
    }
  },

  // Utils
  argsParser: {
    defaultEnvironment: 'development',
    defaultProxyServer: 'localhost:3000'
  },

  // Functions
  dynamic: {
    setSvgType: function(type) {
      svgType = type;
      console.log('svgType', type, svgType);
    }
  },

  // Plugins
  browserSync: {
    app: {
      ghostMode: {
        clicks: true,
        forms: true,
        scroll: true
      },
      logLevel: 'info',
      notify: true,
      open: false,
      port: 1234,
      // proxy gets set inside server.js task
      // reloadDebounce: 2000,
      // reloadDelay: 500,
      reloadOnRestart: true,
      ui: {
        port: 1235
      }
    },
    documentation: {
      open: false,
      port: 5678,
      ui: {
        port: 5679
      }
    }
  },

  clean: {},

  concat: {},

  htmlhint: {
    'doctype-first': false,
    'spec-char-escape': false
  },

  htmlmin: {
    collapseWhitespace: true,
    removeComments: true
  },

  inject: {
    vendor: {
      relative: true,
      name: 'vendor'
    },
    app: {
      relative: true,
      name: 'app'
    }
  },

  jshint: config + '/jshint.js',

  mainBowerFiles: {
    styles: {
      filter: /\.css$/i
    },
    scripts: {
      filter: /\.js$/i
    }
  },

  minifyCss: {},

  ngdocs: {
    startPage: '/app',
    title: 'Webinterface Documentation'
  },

  ngHtml2Js: {
    moduleName: 'guh',
    declareModule: false
  },

  order: [
    'lodash.js',
    'angular.js',
    'angular-animate.js',
    'angular-hero.js',
    'angular-messages.js',
    'angular-sanitize.js',
    'angular-ui-router.js',
    'reconnecting-websocket.js',
    'js-data.js',
    'js-data-debug.js',
    'js-data-angular.js',
    'guh-libjs.js',
    'ngDialog.js',
    'hotkeys.js'
  ],

  rename: {
    suffix: '.min'
  },

  sass: {
    errLogToConsole: true,
    includePaths: neat.includePaths,
    precision: 8
  },

  size: {
    showFiles: true
  },

  sourcemaps: {},

  svgSprite: {
    mode: {
      css: {
        // dest: 'assets',
        example: true,
        render: {
          css: true
        }
        // Sprite attribute set inside gulp pipe with following structure:
        // sprite: 'svg/<vendor|ui>.css-<revision>.svg'
      },
      symbol: {
        dest: 'assets',
        example: true
        // Sprite attribute set inside gulp pipe with following structure:
        // sprite: 'svg/<vendor|ui>.symbol-<revision>.svg'
      }
    }
  },

  uglify: {
    mangle: false
  }
};