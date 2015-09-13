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


/**
 * @ngdoc interface
 * @name guh.intro.controller:IntroCtrl
 *
 * @description
 * Show intro screen(s)
 *
 */

(function(){
  'use strict';

  angular
    .module('guh.intro')
    .controller('IntroCtrl', IntroCtrl);

  IntroCtrl.$inject = ['$log', '$scope', '$q', '$timeout', '$state', 'websocketService', 'app', 'modelsHelper', 'DSVendor', 'DSDeviceClass', 'DSDevice', 'DSRule'];

  function IntroCtrl($log, $scope, $q, $timeout, $state, websocketService, app, modelsHelper, DSVendor, DSDeviceClass, DSDevice, DSRule) {
    
    var vm = this;

    vm.check = true;
    vm.setup = false;
    vm.load = false;
    vm.hostAddress = '';

    vm.checkHostAddress = checkHostAddress;
    vm.setHostAddress = setHostAddress;
    vm.resetHostAddress = resetHostAddress;

    function _init() {
      // Set default guh host
      vm.hostAddress = app.host.websocket;

      // Try to connect to guh host
      websocketService.reconnect();
    }

    function _findAllVendors() {
      return DSVendor.findAll();
    }

    function _findAllDeviceClasses() {
      return DSDeviceClass.findAll();
    }

    function _findDeviceClassRelations(deviceClasses) {
      return angular.forEach(deviceClasses, function(deviceClass) {
        return DSDeviceClass.loadRelations(deviceClass, ['actionType', 'eventType', 'stateType']);
      });
    }

    function _findAllDevices() {
      return DSDevice.findAll();
    }

    // TODO: Find out why this isn't working (deviceClass relations are working because they are already loaded when deviceClasses are loaded)
    function _findDeviceRelations(devices) {
      return angular.forEach(devices, function(device) {
        return DSDevice.loadRelations(device, ['state']);
      });
    }

    function _findAllRules() {
      return DSRule.findAll();
    }

    function _loadData() {
      $q.all([
          _findAllVendors(),
          _findAllDeviceClasses()
            .then(_findDeviceClassRelations),
          _findAllDevices()
            .then(_findDeviceRelations),
          _findAllRules()
        ])
        .then(function(data) {
          /* jshint unused:false */

          // Wait some time to avoid flickering when visiting intro-page where data is already loaded
          $timeout(function() {
            $state.go('guh.devices.master');
          }, 1000);
        })
        .catch(function(error) {
          $log.error(error);
        });
    }

    function checkHostAddress() {
      $log.log(vm.hostAddress);
    }

    function setHostAddress() {
      // Override host and url defaults
      app.host.restApi = vm.hostAddress;
      app.apiUrl = app.protocol.restApi + '://' + app.host.restApi + ':' + app.port.restApi + '/api/v1';

      app.host.websocket = vm.hostAddress;
      app.websocketUrl = app.protocol.websocket + '://' + app.host.websocket + ':' + app.port.websocket;

      // Override basepath for templates
      modelsHelper.setBasePath();

      // Try to reconnect to guh host with new host
      websocketService.reconnect();
      vm.check = true;
      vm.setup = false;
      vm.load = false;
    }

    function resetHostAddress() {
      vm.hostAddress = app.host.websocket;
    }

    $scope.$on('WebsocketConnected', function(event, data) {
      /* jshint unused:false */

      vm.check = false;
      vm.setup = false;
      vm.load = true;

      _loadData();
    });

    $scope.$on('WebsocketConnectionError', function(event, data) {
      /* jshint unused:false */
      
      // Reset
      resetHostAddress();

      // Setup
      vm.check = false;
      vm.setup = true;
      vm.load = false;
    });


    _init();

  }

}());
