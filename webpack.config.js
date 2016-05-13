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


var _ = require('lodash');
var minimist = require('minimist');
var chalk = require('chalk');
var path = require('path');
var bourbon = require('node-bourbon').includePaths;
var webpack = require('webpack');


// Webpack plugins
var CleanWebpackPlugin = require('clean-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');


var INCLUDE_FILES = [
  path.resolve(__dirname, 'src')
];

var EXCLUDE_FILES = [
  path.resolve(__dirname, 'src/api'),
  path.resolve(__dirname, 'src/logging'),
  path.resolve(__dirname, 'src/models'),
  path.resolve(__dirname, 'src/**/*_test')
];

var DEFAULT_TARGET = 'BUILD';

var DEFAULT_PARAMS = {
  entry: {
    app: path.resolve(__dirname, 'src/index.js')
  },
  output: {
    filename: '[name].js',
    sourceMapFilename: '[name].js.map',
  },
  module: {
    preLoaders: [],
    loaders: [
      // HTML
      {
        test: /\.html$/,
        loader: 'html',
        include: INCLUDE_FILES,
        exclude: EXCLUDE_FILES
      }
    ],
    postLoaders: []
  },
  plugins: [
    // Insert index.html with automatically added dependencies
    // Link: https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
      inject: 'body'
    }),
    new webpack.DefinePlugin({
      __DEV__: process.env.NODE_ENV !== 'production',
      __PRODUCTION__: process.env.NODE_ENV === 'production'
    }),
    new webpack.optimize.DedupePlugin()
  ],
  resolve: {
    alias: {
      'angular': path.resolve(path.join(__dirname, 'node_modules', 'angular'))
    }
  },
  colors: true,
  debug: true,
  progress: true
};

var PARAMS_PER_TARGET = {

  DEV: {
    output: {
      path: path.resolve(__dirname, 'dev')
    },
    module: {
      preLoaders: [
        // Scripts
        {
          test: /\.js$/,
          loader: 'babel!eslint',
          include: INCLUDE_FILES,
          exclude: EXCLUDE_FILES
        }
      ],
      loaders: [
        // Styles
        {
          test: /\.scss$/,
          loader: 'style!css!sass?sourceMap&includePaths[]=' + bourbon,
          include: INCLUDE_FILES,
          exclude: EXCLUDE_FILES
        }
      ]
    },
    // Not working with ExtractTextWebpackPlugin => WHY?
    plugins: [
      // Automatically add 'module.hot.accept();' on the end of each js-module to hot reload modules when SASS files (with css modules) were changed
      new webpack.HotModuleReplacementPlugin()
    ],
    devServer: {
      inline: true,
      hot: true,
      contentBase: '/dev',
      port: 5678
    },
    devtool: 'inline-source-map'
  },

  BUILD: {
    output: {
      path: path.resolve(__dirname, 'build')
    },
    module: {
      preLoaders: [
        // Scripts
        {
          test: /\.js$/,
          loader: 'babel!eslint',
          include: INCLUDE_FILES,
          exclude: EXCLUDE_FILES
        }
      ],
      loaders: [
        // Styles
        {
          test: /\.scss$/,
          loader: ExtractTextWebpackPlugin.extract('style', 'css?sourceMap!sass?sourceMap&includePaths[]=' + bourbon),
          include: INCLUDE_FILES,
          exclude: EXCLUDE_FILES
        }
      ]
    },
    plugins: [
      new CleanWebpackPlugin([
        'build'
      ], {
        root: __dirname,
        verbose: true 
      }),
      new ExtractTextWebpackPlugin('styles.css')
    ],
    devtool: 'source-map'
  },

  DIST: {
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].min.js'
    },
    module: {
      preLoaders: [
        // Scripts
        {
          test: /\.js$/,
          loader: 'babel!eslint',
          include: INCLUDE_FILES,
          exclude: EXCLUDE_FILES
        }
      ],
      loaders: [
        // Styles
        {
          test: /\.scss$/,
          loader: ExtractTextWebpackPlugin.extract('style', 'css?sourceMap!sass?sourceMap&includePaths[]=' + bourbon),
          include: INCLUDE_FILES,
          exclude: EXCLUDE_FILES
        }
      ]
    },
    plugins: [
      new CleanWebpackPlugin([
        'dist'
      ], {
        root: __dirname,
        verbose: true 
      }),
      new ExtractTextWebpackPlugin('styles.css'),
      new webpack.optimize.UglifyJsPlugin({
        mangle: false
      })
    ]
  },

  TEST: {
  //   module: {
  //     preLoaders: [
  //       // Scripts
  //       {
  //         test: /\.js$/,
  //         loader: 'babel!eslint',
  //         include: [
  //           path.resolve(__dirname, 'test.webpack'),
  //           path.resolve(__dirname, 'src/**/*_test')
  //         ]
  //       }
  //     ],
  //     loaders: [
  //       // Styles
  //       {
  //         test: /\.scss$/,
  //         loader: 'style!css?sourceMap&modules&localIdentName=[path][name]---[local]---[hash:base64:5]!sass?sourceMap',
  //         include: INCLUDE_FILES,
  //         exclude: EXCLUDE_FILES
  //       }
  //     ]
  //   },
  //   devtool: 'inline-source-map'
  }

};


var target = _resolveBuildTarget(DEFAULT_TARGET);
var params = _.mergeWith(DEFAULT_PARAMS, PARAMS_PER_TARGET[target], _mergeArraysCustomizer);

_printBuildInfo(target, params);

module.exports = params;


function _resolveBuildTarget(defaultTarget) {
  var target = minimist(process.argv.slice(2)).TARGET;
  if(!target) {
    console.log('No build target provided, using default target instead.\n\n');
    target = defaultTarget;
  }
  return target;
}

function _printBuildInfo(target, params) {
  console.log('\nStarting ' + chalk.bold.green('"' + target + '"') + ' build');
  if (target === 'DEV') {
    console.log('Dev server: ' + chalk.bold.yellow('http://localhost:' + params.devServer.port) + '\n\n');
  } else {
    console.log('\n\n');
  }
}

function _mergeArraysCustomizer(a, b) {
  if(_.isArray(a)) {
    return a.concat(b);
  }
}