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

  ThingDetailsCtrl.$inject = ['app', 'libs', '$log', '$scope', '$filter', '$state', '$stateParams', 'DSDevice', 'DSDeviceClass', 'DSParamType', 'DSState', 'DSRule', 'NavigationBar', 'ActionBar', 'ModalContainer'];

  /**
   * @ngdoc controller
   * @name guh.containers.controller:ThingDetailsCtrl
   * @description Container component for a single thing.
   *
   */
  function ThingDetailsCtrl(app, libs, $log, $scope, $filter, $state, $stateParams, DSDevice, DSDeviceClass, DSParamType, DSState, DSRule, NavigationBar, ActionBar, ModalContainer) {
    
    var vm = this;
    var device;

    vm.showActions = true;
    vm.showStates = false;
    vm.showSettings = false;

    vm.$onInit = $onInit;
    vm.back = back;
    vm.show = show;
    vm.edit = edit;
    vm.remove = remove;
    vm.isCritical = isCritical;


    function $onInit() {
      if(!app.dataLoaded) {
        $state.go('guh.intro', {
          previousState: {
            name: $state.current.name,
            params: {
              deviceId: $stateParams.deviceId
            }
          }
        });
      } else {
        _initNavigation();
        _initActions();

        if(libs._.has($stateParams, 'deviceId') && $stateParams.deviceId) {
          device = DSDevice.get($stateParams.deviceId);
          _initThing(device);
        }
      }
    }

    function _initNavigation() {
      NavigationBar.changeItems([]);
    }

    function _initActions() {
      ActionBar.changeItems([
        {
          position: 1,
          iconUrl: './assets/svg/ui/ui.symbol.svg#chevron-left',
          label: 'Back to things',
          callback: back
        },
        {
          position: 2,
          iconUrl: './assets/svg/ui/ui.symbol.svg#edit',
          label: 'Edit',
          callback: edit
        },
        {
          position: 3,
          iconUrl: './assets/svg/ui/ui.symbol.svg#trash-a',
          label: 'Remove',
          callback: remove
        }
      ]);
    }

    function _initThing(device) {
      vm.device = device;
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

      vm.getDescription = device.getDescription;

      // Filter values of type "Double" to show only two digits after decimal point
      angular.forEach(vm.params, function(param, index) {
        // Find paramType to param
        var paramType = DSParamType.get(param.paramTypeId);

        if(angular.isDefined(paramType) && paramType.type === app.basicTypes.double) {
          vm.params[index].value = $filter('number')(vm.params[index].value, '2');
        }
      });

      angular.forEach(vm.states, function(state, index) {
        if(state.stateType.type === app.basicTypes.double) {
          vm.states[index].value = $filter('number')(vm.states[index].value, '2');
        }

        vm.statesObject[$filter('camelCase')(state.stateType.name)] = vm.states[index];
      });

      // Wait for templateUrl check
      device.deviceClass.templateUrl
        .then(function(fileExists) {
          vm.templateUrl = fileExists;
        })
        .catch(function(error) {
          $log.error('guh.controller.ThingDetailsCtrl', error);
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
          var stateType = libs._.find(stateTypes, function(stateType) {
            return stateType.id === actionType.id;
          });
          var state = vm.statesObject[$filter('camelCase')(stateType.name)];

          // Add state to action
          action.state = state;
          action.stateType = stateType;

          // Remove state from sates array
          vm.states = vm.states.filter(function(state) {
            return state.stateType.id !== actionType.id;
          });
        }

        vm.actions.push(action);
        vm.actionsObject[$filter('camelCase')(actionType.name)] = action;
      });

      // Params
      angular.forEach(vm.params, function(param) {
        vm.paramsObject[param.paramTypeId] = param;
      });

      // Enhanced Params
      angular.forEach(vm.params, function(param) {
        vm.enhancedParams.push({
          param: param,
          paramType: DSParamType.get(param.paramTypeId)
        });
      });

      // States
      angular.forEach(vm.states, function(state) {
        vm.statesObject[$filter('camelCase')(state.stateType.name)] = state;
      });
    }

    function _getErrorData(error) {
      // var errorCode = error.data ? (error.data.error ? error.data.error : (error.data.deviceError) ? error.data.deviceError : null) : null;
      var errorCode = error.deviceError ? error.deviceError : null;
      var errorData = {};

      if(errorCode) {
        switch(errorCode) {
          case 'DeviceErrorDeviceIsChild':
            errorData.devices = _getDevices();
            break;
          case 'DeviceErrorDeviceInRule':
            var ruleIds = error.ruleIds ? error.ruleIds : [];
            errorData.rules = _getRules(ruleIds);
            break;
          default:
            $log.error(error);
        }
      } else {
        $log.error(error);
      }

      return errorData;
    }

    function _getDevices() {
      var deviceToDelete = device;
      var devices = {
        parentDevice: {},
        childDevices: []
      };

      if(DSDevice.is(deviceToDelete)) {
        var parentDevice;
        var childDevices;

        while(angular.isDefined(deviceToDelete.parentId)) {
          // Parent
          parentDevice = DSDevice.get(deviceToDelete.parentId);
          childDevices = [];
          
          // Children
          if(DSDevice.is(parentDevice)) {
            var currentChildDevices = DSDevice.getAll().filter(function(deviceToDelete) {
              return deviceToDelete.parentId === parentDevice.id;
            });

            childDevices = childDevices.concat(currentChildDevices);
          }

          // Override deviceToDelete with it's parent to traverse up
          deviceToDelete = parentDevice;
        }

        devices.parentDevice = parentDevice;

        // Filter deviceToDelete from childDevices
        devices.childDevices = childDevices.filter(function(childDevice) {
          return childDevice.id !== deviceToDelete.id;
        });
      }

      return devices;
    }

    function _getRules(ruleIds) {
      return DSRule.getAll(ruleIds);
    }


    function back() {
      $state.go('guh.things');
    }

    function show(type) {
      switch(type) {
        case 'actions':
          vm.showActions = true;
          vm.showStates = false;
          vm.showSettings = false;
          break;
        case 'states':
          vm.showActions = false;
          vm.showStates = true;
          vm.showSettings = false;
          break;
        case 'settings':
          vm.showActions = false;
          vm.showStates = false;
          vm.showSettings = true;
          break;
        default:
          vm.showActions = true;
          vm.showStates = false;
          vm.showSettings = false;
          break;
      }
    }

    function edit() {
      ModalContainer
        .add({
          controller: ['modalInstance', function(modalInstance) {
            this.modalInstance = modalInstance;
            this.thing = device;
          }],
          controllerAs: 'modal',
          data: null,
          template: '<guh-edit-thing thing="modal.thing" modal-instance="modal.modalInstance"></guh-edit-thing>'
        })
        .then(function(modal) {
          modal.open();
        })
        .catch(function(error) {
          $log.error('error', error);
        });
    }

    function remove() {
      device
        .remove()
        .then(function() {
          // $state.go('guh.things');
        })
        .catch(function(error) {
          $log.error('error', error);
          var errorData = _getErrorData(error);
          $log.error('errorData', errorData);

          ModalContainer
            .add({
              controller: ['modalInstance', function(modalInstance) {
                this.modalInstance = modalInstance;
                this.thing = device;
                this.errorData = errorData;
              }],
              controllerAs: 'modal',
              data: null,
              template: '<guh-remove-thing thing="modal.thing" error-data="modal.errorData" modal-instance="modal.modalInstance"></guh-remove-thing>'
            })
            .then(function(modal) {
              modal.open();
            })
            .catch(function(error) {
              $log.error('error', error);
            });
        });
    }

    function isCritical() {
      if(angular.isDefined(vm.deviceClass.criticalStateTypeId)) {
        var criticalStateTypes = vm.deviceClass.stateTypes.filter(function(stateType) {
          return stateType.id === vm.deviceClass.criticalStateTypeId;
        });

        // Should be exactly one criticalStateType
        if(angular.isDefined(criticalStateTypes[0])) {
          var criticalStates = vm.device.states.filter(function(state) {
            return state.stateType.id === criticalStateTypes[0].id;
          });

          // Should be exactly one state
          return !criticalStates[0].value;
        }
      }

      return false;
    }


    DSState.on('DS.change', function(DSState, newState) {
      // States
      angular.forEach(vm.states, function(state, index) {
        if(state.stateType.type === app.basicTypes.double && state.stateType.id === newState.stateType.id) {
          vm.states[index].value = $filter('number')(newState.value, '2');
        }
      });
    });

  }

}());
