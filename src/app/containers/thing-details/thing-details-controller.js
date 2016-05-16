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
    .controller('ThingDetailsCtrl', ThingDetailsCtrl);

  ThingDetailsCtrl.$inject = ['app', 'libs', '$log', '$filter', '$state', '$stateParams', 'DSDevice', 'DSDeviceClass', 'DSState'];

  /**
   * @ngdoc controller
   * @name guh.containers.controller:ThingDetailsCtrl
   * @description Container component for a single thing.
   *
   */
  function ThingDetailsCtrl(app, libs, $log, $filter, $state, $stateParams, DSDevice, DSDeviceClass, DSState) {
    
    var vm = this;

    vm.device = {};

    vm.$onInit = onInit;
    vm.back = back;

    function onInit() {
      $log.log('ThingDetailsCtrl');

      if(!app.dataLoaded) {
        $state.go('guh.intro', {
          previousState: {
            name: $state.current.name,
            params: $stateParams
          }
        });
      }

      var device;

      if(libs._.has($stateParams, 'deviceId') && $stateParams.deviceId) {
        device = DSDevice.get($stateParams.deviceId);
        _initThing(device);
      } else {
        $log.error('Missing deviceId.');
      }
    }

    function _initThing(device) {
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

        if(angular.isDefined(paramType) && paramType.type === app.basicTypes.double) {
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

    function back() {
      $state.go('guh.things');
    }


    DSState.on('DS.change', function(DSState, newState) {
      angular.forEach(vm.states, function(state, index) {
        if(state.stateType.type === app.basicTypes.double && state.stateType.id === newState.stateType.id) {
          vm.states[index].value = $filter('number')(newState.value, '2');
        }
      });
    });

  }

}());
