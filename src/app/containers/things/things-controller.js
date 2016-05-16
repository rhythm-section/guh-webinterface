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
    .module('guh.containers')
    .controller('ThingsCtrl', ThingsCtrl);

  ThingsCtrl.$inject = ['app', 'libs', '$log', '$state', '$stateParams', 'DSDevice'];

  /**
   * @ngdoc controller
   * @name guh.containers.controller:ThingsCtrl
   * @description Container component for things.
   *
   */
  function ThingsCtrl(app, libs, $log, $state, $stateParams, DSDevice) {
    
    var vm = this;

    vm.$onInit = onInit;
    vm.showDetails = showDetails;
    

    function onInit() {
      var deviceId = (libs._.has($stateParams, 'deviceId') && $stateParams.deviceId) ? $stateParams.deviceId : null;
      
      if(!app.dataLoaded) {
        $state.go('guh.intro', {
          previousState: {
            name: $state.current.name,
            params: {
              deviceId: deviceId
            }
          }
        });
      }

      vm.configuredDevices = DSDevice.getAll();
    }

    function showDetails(tileId) {
      $state.go('guh.things.current', {
        deviceId: tileId
      });
    }

  }

}());
