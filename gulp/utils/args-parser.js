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

var yargs = require('yargs');
var logger = require('../utils/logger');


/*
 * Configuration
 */

// Defaults
var argsParserConfig = require('../config/gulp').argsParser;

// Parsing arguments passed to gulp command
var args = yargs
  .alias('e', 'environment')
  .alias('d', 'documentation')
  .alias('s', 'server')
  .alias('w', 'watch')
  .alias('t', 'test')
  .alias('p', 'proxy')
  .alias('h', 'hosting')  // local or cloud
  .argv;


/*
 * Methods
 */

var getArgs = function() {
  return args;
};

var getEnvironment = function() {
  if(args.environment === undefined || args.environment === true) {
    logger.info('Environment not defined. Using default: "' + argsParserConfig.defaultEnvironment + '"');
    return argsParserConfig.defaultEnvironment;
  } else {
    return args.environment;  
  }  
};

var getProxyServer = function() {
  if(args.proxy === undefined) {
    logger.info('Guh host address not defined. Using default: "' + argsParserConfig.defaultProxyServer + '"');
    return argsParserConfig.defaultProxyServer;
  } else {
    return args.proxy;
  }
};

var getHosting = function() {
  if(args.hosting === undefined) {
    logger.info('Hosting environment not defined. Using default: "' + argsParserConfig.defaultHosting + '"');
    return argsParserConfig.defaultHosting;
  } else {
    return args.hosting;
  }
};

var isDocumentationServer = function() {
  return !!args.documentation;
};

var isServer = function() {
  return !!args.server;
};

var isWatch = function() {
  return !!args.watch;
};


/*
 * Module
 */

module.exports = {
  getArgs: getArgs,
  getEnvironment: getEnvironment,
  getProxyServer: getProxyServer,
  getHosting: getHosting,
  isDocumentationServer: isDocumentationServer,
  isServer: isServer,
  isWatch: isWatch
};
