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
 * @name guh.devices.controller:DevicesDetailCtrl
 *
 * @description
 * Load and show details of certain device.
 *
 */

(function(){
  'use strict';

  angular
    .module('guh.devices')
    .controller('DevicesDetailCtrl', DevicesDetailCtrl);

  DevicesDetailCtrl.$inject = ['$log', '$scope', '$state', '$stateParams', 'libs', 'DSDevice', 'DSState'];

  function DevicesDetailCtrl($log, $scope, $state, $stateParams, libs, DSDevice, DSState) {

    var vm = this;
    var currentDevice = {};

    // Public methods
    vm.remove = remove;


    /**
     * @ngdoc interface
     * @name _loadViewData
     * @methodOf guh.devices.controller:DevicesDetailCtrl
     *
     * @description
     * Set data for view.
     * 
     * @param {boolean} bypassCache True if device should be requested from Server instead of application memory (datastore)
     *
     */

    function _loadViewData(bypassCache) {
      var deviceId = $stateParams.deviceId;

      // Return to device list if deviceId is unknown (e.g. on browser reload devices/detail)
      if(!deviceId) {
        $state.go('guh.devices.master');
        return;
      }

      _findDevice(bypassCache, deviceId)
        .then(function(device) {
          currentDevice = device;

          // Set view variables
          vm.setupComplete = currentDevice.setupComplete;
          vm.actions = [];
          vm.deviceClass = currentDevice.deviceClass;
          vm.deviceClassId = currentDevice.deviceClassId;
          vm.id = currentDevice.id;
          vm.name = (currentDevice.name === 'Name') ? currentDevice.deviceClass.name : currentDevice.name;
          vm.params = currentDevice.params;
          vm.states = currentDevice.states;

          // Wait for templateUrl check
          device.deviceClass.templateUrl
            .then(function(fileExists) {
              vm.templateUrl = fileExists;
            })
            .catch(function(error) {
              $log.error('guh.controller.DevicesDetailCtrl', error);
            })
            .finally(function() {
              vm.templateReady = true;
            });

          // Actions
          angular.forEach(vm.deviceClass.actionTypes, function(actionType) {
            var action = {};
            action.actionType = actionType;

            if(actionType.hasState) {  
              var state = libs._.find(vm.deviceClass.stateTypes, function(stateType) {
                return stateType.id === actionType.id;
              });

              // Add state to action
              action.state = state;

              // Remove state from sates array
              vm.states = libs._.without(vm.states, state);
            }

            vm.actions.push(action);
          });
          
          // Subscribe to websocket messages
          _subscribeToWebsocket();
        })
        .catch(function(error) {
          $log.error('guh.controller.DevicesDetailCtrl', error);
        });
    }


    /**
     * @ngdoc interface
     * @name _findDevice
     * @methodOf guh.devices.controller:DevicesDetailCtrl
     *
     * @description
     * Load configured device
     * 
     * @param {boolean} bypassCache True if device should be requested from Server instead of application memory (datastore)
     * @param {String} deviceId ID of the device that should be displayed
     * @returns {Array} Promise of DSDevice Object
     *
     */

    function _findDevice(bypassCache, deviceId) {
      if(bypassCache) {
        return DSDevice.find(deviceId, { bypassCache: true });
      }
      
      return DSDevice.find(deviceId);
    }

    function _subscribeToWebsocket() {
      currentDevice.subscribe(function(message) {
        if(angular.isDefined(message.params.deviceId) && message.params.deviceId === vm.id) {
          DSState.inject([{
            stateTypeId: message.params.stateTypeId,
            value: message.params.value
          }]);
        }
      });
    }

    function _leaveState() {
      // Unsubscribe websocket connection when leaving this state
      if(DSDevice.is(currentDevice)) {
        currentDevice.unsubscribe(currentDevice.id);
      }
    }

    function remove() {
      currentDevice
        .remove()
        .then(function(response) {
          $log.log('Device succesfully removed');
        })
        .catch(function(error) {
          // TODO: Build general error handler
          // TODO: Handle error when device in use (rules)
          $log.error(error);
        });
    }

    $scope.$on('$stateChangeStart', function() {
      _leaveState();
    });


    // Initialize controller
    _loadViewData();

  }

}());
