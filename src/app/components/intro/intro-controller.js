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

  IntroCtrl.$inject = ['$log', '$rootScope', '$scope', '$q', '$location', '$timeout', '$state', '$stateParams', 'host', 'websocketService', 'libs', 'app', 'modelsHelper', 'DS', 'DSPlugin', 'DSVendor', 'DSDeviceClass', 'DSDevice', 'DSState', 'DSRule', 'DSSettings'];

  function IntroCtrl($log, $rootScope, $scope, $q, $location, $timeout, $state, $stateParams, host, websocketService, libs, app, modelsHelper, DS, DSPlugin, DSVendor, DSDeviceClass, DSDevice, DSState, DSRule, DSSettings) {
    
    var vm = this;
    var protocol = $location.protocol();
    var port = $location.port();
    var ssl = protocol.charAt(protocol.length - 1) === 's' ? true : false;

    // State variables
    vm.check = false;
    vm.setup = false;
    vm.load = false;
    vm.valid = true;
    vm.submitted = false;

    // Current host
    vm.host = '';

    // Methods
    vm.checkHost = checkHost;
    vm.setHost = setHost;
    vm.resetHost = resetHost;

    function _init() {
      // Set default host
      vm.host = host;

      // Set config with new host
      _overrideConfig();

      // Try to connect to host
      _checkConnection();
    }

    function _overrideConfig() {
      // Override host and url defaults
      app.protocol.restApi = ssl ? 'https' : 'http';
      app.protocol.websocket = ssl ? 'wss' : 'ws';
      app.host = vm.host;

      if(app.environment === 'development') {
        app.apiUrl = app.protocol.restApi + '://' + app.host + ':' + app.port.restApi + '/api/v1';
      } else {
        app.apiUrl = app.protocol.restApi + '://' + app.host + ':' + port + '/api/v1';
      }
      app.websocketUrl = app.protocol.websocket + '://' + app.host + ':' + app.port.websocket;

      // Override basepath for templates
      modelsHelper.setBasePath();
    }

    function _checkConnection() {
      vm.check = true;

      $timeout(function() {
        websocketService.reconnect();
      }, 2000);
    }

    function _saveHost() {
      DSSettings
        .find('admin')
        .catch(function(error) {
          /* jshint unused:false */
          
          DSSettings
            .create({
              userId: 'admin',
              host: app.host
            });
        });
    }

    function _loadPlugins() {
      return DSPlugin.load();
    }

    function _loadVendors() {
      return DSVendor.load();
    }

    function _loadDeviceClasses() {
      return DSDeviceClass.load();
    }

    function _linkRelations(deviceClasses) {
      return angular.forEach(deviceClasses, function(deviceClass) {
        deviceClass.actionTypesLinked = DSDeviceClass.getAllActionTypes(deviceClass.id);
        deviceClass.eventTypesLinked = DSDeviceClass.getAllEventTypes(deviceClass.id);
        deviceClass.stateTypesLinked = DSDeviceClass.getAllStateTypes(deviceClass.id);
      });
    }

    function _loadDevices() {
      return DSDevice.load();
    }

    function _loadRules() {
      return DSRule.load();
    }

    function _loadData() {
      $q.all([
          _loadPlugins(),
          _loadVendors(),
          _loadDeviceClasses()
            .then(_linkRelations),
          _loadDevices(),
          _loadRules()
        ])
        .then(function(data) {
          /* jshint unused:false */
          app.dataLoaded = true;

          // Wait some time to avoid flickering when visiting intro-page where data is already loaded
          $timeout(function() {
            if(angular.isObject($stateParams.previousState) && !libs._.isEmpty($stateParams.previousState)) {
              $state.go($stateParams.previousState.name, $stateParams.previousState.params);
            } else {
              $state.go('guh.devices.master');
            }
          }, 2000);
        })
        .catch(function(error) {
          $log.error(error);
        });
    }

    // TODO: Replace with directive (form-field-ipV4 and form-field-ipV6)
    function checkHost() {
      // Copyright: smink, http://stackoverflow.com/questions/106179/regular-expression-to-match-dns-hostname-or-ip-address
      var validIpAddressRegex = new RegExp('^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$');
      // Valid as per RFC 1123: http://tools.ietf.org/html/rfc1123
      var validHostnameRegex = new RegExp('^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$');
      vm.valid = false;

      if(angular.isDefined(vm.host)) {
        vm.valid = validIpAddressRegex.test(vm.host) || validHostnameRegex.test(vm.host);
      }
    }

    function setHost() {
      vm.submitted = true;
      $timeout(function() {
        vm.submitted = false;
      }, 1000);

      if(!vm.valid) {
        return;
      }

      _overrideConfig();

      vm.check = true;
      vm.setup = false;
      vm.load = false;

      // Try to reconnect to guh host with new host
      $timeout(function() {
        websocketService.reconnect();
      }, 2000);
    }

    function resetHost() {
      vm.host = host;
      checkHost();
    }

    $scope.$on('WebsocketConnected', function(event, data) {
      /* jshint unused:false */

      _saveHost();

      // Load data
      vm.check = false;
      vm.setup = false;
      vm.load = true;

      _loadData();
    });

    angular.forEach(['WebsocketConnectionError', 'WebsocketConnectionLost'], function(websocketEvent) {
      $scope.$on(websocketEvent, function(event, data) {
        /* jshint unused:false */

        // Clear localstorage entry if already saved
        return DSSettings
          .find('admin')
          .then(function(data) {
            DSSettings
              .destroy('admin')
              .then(function() {
                $log.log('localstorage successful deleted', DSSettings.get('admin'));
              });
          })
          .finally(function() {
            // Reset to default
            // resetHost();

            // Setup
            vm.check = false;
            vm.setup = true;
            vm.load = false;
          });
      });
    });


    _init();

  }

}());
