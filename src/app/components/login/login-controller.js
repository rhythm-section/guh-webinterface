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
    .controller('LoginCtrl', LoginCtrl);


  LoginCtrl.$inject = ['$log', '$scope', '$timeout', 'cloudService', 'DSAuthentication'];
  // LoginCtrl.$inject = ['$log', '$scope', '$timeout', 'cloudService', 'apiService', 'DSAuthentication'];
  // LoginCtrl.$inject = ['$log', '$scope', '$timeout', 'DSAuthentication'];

  /**
   * @ngdoc controller
   * @name guh.containers.controller:LoginCtrl
   * @description Presentational component for login.
   *
   */
  // function LoginCtrl($log, $scope, $timeout, DSAuthentication) {
  function LoginCtrl($log, $scope, $timeout, cloudService, DSAuthentication) {
  // function LoginCtrl($log, $scope, $timeout, cloudService, apiService, DSAuthentication) {
    
    var vm = this;

    vm.email;
    vm.password;
    vm.loginStatus = {
      pending: false,
      success: false,
      failure: false
    };

    vm.$onInit = $onInit;
    vm.login = login;


    function $onInit() {}

    function login(isValid) {
      vm.loginStatus.pending = true;

      if(isValid) {
        // DSAuthentication
          // .authenticateCloudUser(vm.email, vm.password)
        cloudService
          .login(vm.email, vm.password)
          .then(function(responseData) {
            // $log.log('apiService', apiService);

            DSAuthentication.create({
              id: 'cloudUser',
              accessToken: responseData.access_token,
              expiresIn: responseData.expires_in,
              refreshToken: responseData.refresh_token,
              tokenType: responseData.token_type
            })
            .then(function(authenticationData) {
              // apiService.setType('cloud');

              vm.loginStatus.pending = false;
              vm.loginStatus.success = true;

              vm.onAuthenticationSuccess({
                authenticationData: authenticationData
              });

              $timeout(function() {
                vm.loginStatus.success = false;
              }, 400);
            })
            .catch(function(error) {
              return error;
            });
          })
          .catch(function(authenticationError) {
            // apiService.setType('local');

            vm.loginStatus.pending = false;
            vm.loginStatus.failure = true;

            vm.onAuthenticationError({
              authenticationError: authenticationError
            });

            $timeout(function() {
              vm.loginStatus.success = false;
            }, 400);
          });
      }
    }

  }

}());
