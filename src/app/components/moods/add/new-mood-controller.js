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
    .module('guh.moods')
    .controller('NewMoodCtrl', NewMoodCtrl);

  NewMoodCtrl.$inject = ['$log', '$rootScope', '$scope', '$state', 'DSDevice', 'DSRule', 'DSHttpAdapter', 'libs', 'app'];

  function NewMoodCtrl($log, $rootScope, $scope, $state, DSDevice, DSRule, DSHttpAdapter, libs, app) {

    // View data
    var vm = this;
    vm.rule = {};
    vm.enterActionDevices = [];
    vm.exitActionDevices = [];

    vm.selectedEnterActionDevice = {};
    vm.selectedExitActionDevice = {};

    vm.selectedEnterActionType = {};
    vm.selectedExitActionType = {};

    vm.selectedEnterActionTypes = {};
    vm.selectedExitActionTypes = {};

    // View methods
    vm.selectEnterAction = selectEnterAction;
    vm.selectExitAction = selectExitAction;
    vm.addEnterActionParams = addEnterActionParams;
    vm.addExitActionParams = addExitActionParams;
    vm.save = save;


    function _init() {
      // Prepare rule object
      vm.rule = {
        actions: [],
        enabled: true,
        name: ''
      };

      // Set devices with actions
      _setActionDevices();
    }

    function _setActionDevices() {
      // TODO: Replace this with initialData from app-routes.js (new dialog/modal service needed)
      var devices = DSDevice.getAll();
      var actionDevices = devices.filter(_hasActions);

      vm.enterActionDevices = angular.copy(actionDevices);
      vm.exitActionDevices = angular.copy(actionDevices);
    }

    function _hasActions(device) {
      return angular.isDefined(device.deviceClass) && device.deviceClass.actionTypes.length > 0 && device.name.indexOf('mood-toggle') === -1;
    }

    function _getRuleActionData(device, actionType, ruleActionParams) {
      var ruleAction = {};

      if(angular.isDefined(device) && angular.isDefined(actionType)) {
        ruleAction.actionTypeId = actionType.id;
        ruleAction.deviceId = device.id;

        if(actionType.paramTypes.length > 0 && angular.isDefined(ruleActionParams)) {
          ruleAction.ruleActionParams = angular.copy(ruleActionParams);
        }
      }

      return ruleAction;
    }

    function _isSelected(enterExitAction, actionType) {
      var ruleActions = enterExitAction === 'enter' ? vm.rule.actions : vm.rule.exitActions;
      var isSelected = false;

      isSelected = libs._.some(ruleActions, 'actionTypeId', actionType.id);

      return isSelected;
    }

    function _removeRuleAction(enterExitAction, device, actionType) {
      var ruleActions = enterExitAction === 'enter' ? vm.rule.actions : vm.rule.exitActions;
      
      var removedRuleAction = libs._.remove(ruleActions, function(ruleAction) {
        return (ruleAction.deviceId === device.id && ruleAction.actionTypeId === actionType.id);
      });

      $log.log('removedRuleAction', removedRuleAction, ruleActions);

      return removedRuleAction;
    }

    function _saveRule() {
      return DSRule
        .create(vm.rule)
        .then(function(rule) {
          $log.log('guh.moods.NewMoodCtrl:controller | Rule created successfully.', rule);

          // Add id to view data
          vm.rule.id = rule.id;

          // Create toggle-button for created mood
          var toggleButtonId = 'c0f511f9-70f5-499b-bd70-2c0e9ddd68c4';
          var toggleButtonParams = [{
            name: 'name',
            value: 'mood-toggle-button-' + rule.id
          }];

          return {
            id: toggleButtonId,
            params: toggleButtonParams
          };
        });
    }

    function _addToggleButton(toggleButton) {
      return DSDevice.add(toggleButton.id, undefined, toggleButton.params);
    }

    function _updateRule(device) {
      DSDevice
        .find(device.id, { bypassCache: true })
        .then(function(device) {
          // Get device relations
          DSDevice
            .loadRelations(device, ['deviceClass'])
            .then(function(device) {
              // Create stateEvaluator for toggle-button
              var stateEvaluator = {
                stateDescriptor: {
                  deviceId: device.id,
                  operator: 'ValueOperatorEquals',
                  stateTypeId: device.deviceClass.stateTypes[0].id,
                  value: true
                }
              };

              // Get created rule and add created stateEvaluator
              vm.rule.stateEvaluator = stateEvaluator;

              $log.log('vm.rule', vm.rule);

              // Update created rule with created stateEvaluator
              DSHttpAdapter
                .PUT(app.apiUrl + '/rules/' + vm.rule.id, vm.rule)
                .then(function() {
                  DSDevice.inject(vm.rule);

                  // Close dialog and update mood master view with new mood
                  $scope.closeThisDialog();

                  $state.go('guh.moods.master', { bypassCache: true }, {
                    reload: true,
                    inherit: false,
                    notify: true
                  });
                })
                .catch(function(error) {
                  $log.log('guh.moods.NewMoodCtrl:controller | Rule not updated.', error);
                });
            })
            .catch(function(error) {
              $log.log('guh.moods.NewMoodCtrl:controller | Relations of device not loaded.', error);
            });
        })
        .catch(function(error) {
          $log.log('guh.moods.NewMoodCtrl:controller | Device not found.', error);
        });
    }

    function selectEnterAction(device, actionType) {
      if(vm.selectedEnterActionTypes[device.id] && vm.selectedEnterActionTypes[device.id][actionType.id]) {
        // Remove ruleAction
        _removeRuleAction('enter', device, actionType);
        vm.selectedEnterActionTypes[device.id][actionType.id] = _isSelected('enter', actionType);
      } else {
        // Add ruleAction
        var ruleAction = _getRuleActionData(device, actionType);

        vm.rule.actions.push(ruleAction);

        if(actionType.paramTypes.length > 0) {
          vm.selectedEnterActionDevice = device;
          vm.selectedEnterActionType = actionType;
          $rootScope.$broadcast('wizard.next', 'addEnterActions');
        }

        // Add "selected" class
        if(!vm.selectedEnterActionTypes[device.id]) {
          vm.selectedEnterActionTypes[device.id] = {};
        }
        vm.selectedEnterActionTypes[device.id][actionType.id] = _isSelected('enter', actionType);
      }
    }

    function selectExitAction(device, actionType) {
      if(vm.selectedExitActionTypes[device.id] && vm.selectedExitActionTypes[device.id][actionType.id]) {
        // Remove ruleAction
        _removeRuleAction('exit', device, actionType);
        vm.selectedExitActionTypes[device.id][actionType.id] = _isSelected('exit', actionType);
      } else {
        // Add ruleAction
        var ruleAction = _getRuleActionData(device, actionType);

        if(angular.isUndefined(vm.rule.exitActions)) {
          vm.rule.exitActions = [];
        }

        vm.rule.exitActions.push(ruleAction);

        if(actionType.paramTypes.length > 0) {
          vm.selectedExitActionDevice = device;
          vm.selectedExitActionType = actionType;
          $rootScope.$broadcast('wizard.next', 'addExitActions');
        }

        // Add "selected" class
        if(!vm.selectedExitActionTypes[device.id]) {
          vm.selectedExitActionTypes[device.id] = {};
        }
        vm.selectedExitActionTypes[device.id][actionType.id] = _isSelected('exit', actionType);
      }
    }

    function addEnterActionParams(params) {
      var ruleAction = _getRuleActionData(vm.selectedEnterActionDevice, vm.selectedEnterActionType, params);
      vm.rule.actions[vm.rule.actions.length - 1] = ruleAction;
      $rootScope.$broadcast('wizard.prev', 'addEnterActions');
    }

    function addExitActionParams(params) {
      var ruleAction = _getRuleActionData(vm.selectedExitActionDevice, vm.selectedExitActionType, params);
      vm.rule.exitActions[vm.rule.exitActions.length - 1] = ruleAction;
      $rootScope.$broadcast('wizard.prev', 'addExitActions');
    }

    function save(params) {
      // Set name
      vm.rule.name = params[0].value;

      _saveRule()
        .then(_addToggleButton)
        .then(_updateRule)
        .catch(function(error) {
          $log.log('guh.moods.NewMoodCtrl:controller | Error while saving mood.', error);
        });
    }


    _init();

  }

}());
