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

(function() {
  'use strict';

  angular
    .module('guh.components')
    .service('Login', Login);

  Login.$inject = ['$log', '$http', 'DSAuthentication'];

  function Login($log, $http, DSAuthentication) {

    /*
     * Service globals
     */

    var urlPathBase = 'https://my.guh.io:8000/';
    // var urlPartAuth = '/oauth2/authorize';
    // var clientId = '94bfe2324ef341f5b8f9085ea936ce5e';
    // var clientSecret = '3abd1aba46f94040b8e0796e91c449ef';
    var responseType = 'token';


    /*
     * Service API
     */

    var service = {
      login: login
    };

    return service;


    /*
     * Private functions
     */
    
    function _getConnections() {
      return DSAuthentication
        .find('general', {
          with: [ 'connection', 'serverInfo' ]
        })
        .then(function(settings) {
          $log.log('_getConnections');
          $log.log('settings', settings);
        })
        .catch(function(error) {
          _handleError(error);
          return false;
        });
    }

    
    /*
     * Public methods
     */

    function login(username, password) {
      $http({
        method: 'GET',
        url: urlPathBase + urlPartAuth,
        params: {
          'response_type': responseType,
          'client_id': clientId,
        }
      }).then(function success(response) {
        $log.log('success', response);
      }, function failure(response) {
        $log.log('failure', response);
      });
    }

  }

}());