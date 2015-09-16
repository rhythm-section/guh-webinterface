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

    // Don't show debugging information
    DSDevice.debug = false;

    var vm = this;
    var device = {};

    // Public methods
    vm.remove = remove;


    /**
     * @ngdoc interface
     * @name _init
     * @methodOf guh.devices.controller:DevicesDetailCtrl
     *
     * @description
     * Set data for view.
     *
     */

    function _init() {
      var deviceId = $stateParams.deviceId;
      
      // Return to device list if deviceId is unknown (e.g. on browser reload devices/detail)
      if(!deviceId) {
        $state.go('guh.devices.master');
        return;
      }

      device = DSDevice.get(deviceId);

      if(angular.isUndefined(device)) {
        $state.go('guh.intro', {
          previousState: {
            name: $state.current.name,
            params: $stateParams
          }
        });
      } else {
        vm.setupComplete = device.setupComplete;
        vm.actions = [];
        vm.deviceClass = device.deviceClass;
        vm.deviceClassId = device.deviceClassId;
        vm.id = device.id;
        vm.name = (device.name === 'Name') ? device.deviceClass.name : device.name;
        vm.params = device.params;
        vm.states = device.states;

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
      }
    }

    function _subscribeToWebsocket() {
      device.subscribe(function(message) {
        if(angular.isDefined(message.params.deviceId) && message.params.deviceId === vm.id) {
          DSState.inject([{
            stateTypeId: message.params.stateTypeId,
            value: message.params.value
          }]);
        }
      });
    }

    function _leaveState() {
      if(DSDevice.is(device)) {
        device.unsubscribe(device.id);
      }
    }

    function remove() {
      device
        .remove()
        .then(function(response) {
          $log.log('Device succesfully removed', response);
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


    _init();

  }

}());
