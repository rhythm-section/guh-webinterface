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

  DevicesDetailCtrl.$inject = ['app', '$log', '$scope', '$filter', '$state', '$stateParams', 'libs', 'DSDevice', 'DSState', 'DSDeviceClass'];

  function DevicesDetailCtrl(app, $log, $scope, $filter, $state, $stateParams, libs, DSDevice, DSState, DSDeviceClass) {

    // Don't show debugging information
    DSDevice.debug = false;

    var vm = this;
    var device = {};

    // Public methods


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
        vm.actionsObject = {};
        vm.deviceClass = device.deviceClass;
        vm.deviceClassId = device.deviceClassId;
        vm.id = device.id;
        vm.name = (device.name === 'Name') ? device.deviceClass.name : device.name;
        vm.params = device.params;
        vm.paramsObject = {};
        vm.enhancedParams = [];
        vm.states = device.states;
        vm.statesObject = {};

        // Filter values of type "Double" to show only two digits after decimal point
        angular.forEach(vm.params, function(param) {
          // Find paramType to param
          var paramType = libs._.find(device.deviceClass.paramTypes, function(paramType) {
            return paramType.name === param.name;
          });

          if(paramType.type === app.basicTypes.double) {
            vm.params[index].value = $filter('number')(vm.params[index].value, '2');
          }
        });

        angular.forEach(vm.states, function(state, index) {
          if(state.stateType.type === app.basicTypes.double) {
            vm.states[index].value = $filter('number')(vm.states[index].value, '2');
          }
        });

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
        var actionTypes = DSDeviceClass.getAllActionTypes(device.deviceClassId);
        var stateTypes = DSDeviceClass.getAllStateTypes(device.deviceClassId);

        angular.forEach(actionTypes, function(actionType) {
          var action = {};
          action.actionType = actionType;

          if(actionType.hasState) {
            var state = libs._.find(stateTypes, function(stateType) {
              return stateType.id === actionType.id;
            });

            // Add state to action
            action.state = state;

            // Remove state from sates array
            vm.states = libs._.without(vm.states, state);
          }

          vm.actions.push(action);
          vm.actionsObject[$filter('camelCase')(actionType.name)] = action;
        });

        // Params
        angular.forEach(vm.params, function(param) {
          vm.paramsObject[$filter('camelCase')(param.name)] = param;
        });

        // Enhanced Params
        angular.forEach(vm.params, function(param) {
          vm.enhancedParams.push({
            param: param,
            paramType: libs._.find(vm.deviceClass.paramTypes, function(paramType) {
              return param.name === paramType.name;
            })
          });
        });

        // States
        angular.forEach(vm.states, function(state) {
          vm.statesObject[$filter('camelCase')(state.stateType.name)] = state;
        });
      }
    }


    DSState.on('DS.change', function(DSState, newState) {
      angular.forEach(vm.states, function(state, index) {
        if(state.stateType.type === app.basicTypes.double && state.stateType.id === newState.stateType.id) {
          vm.states[index].value = $filter('number')(newState.value, '2');
        }
      });
    });


    _init();

  }

}());
