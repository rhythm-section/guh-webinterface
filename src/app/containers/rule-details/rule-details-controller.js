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
    .controller('RuleDetailsCtrl', RuleDetailsCtrl);

  RuleDetailsCtrl.$inject = ['app', 'libs', '$log', '$element', '$state', '$stateParams', 'DSRule', 'DSDevice', 'DSStateType', 'DSEventType', 'DSActionType', 'DSParamType', 'NavigationBar', 'ActionBar'];

  /**
   * @ngdoc controller
   * @name guh.containers.controller:RuleDetailsCtrl
   * @description Container component for a single rule.
   *
   */
  function RuleDetailsCtrl(app, libs, $log, $element, $state, $stateParams, DSRule, DSDevice, DSStateType, DSEventType, DSActionType, DSParamType, NavigationBar, ActionBar) {
    
    var vm = this;
    var rule = {};

    vm.rule = {};
    vm.showEnterActions = true;
    vm.showExitActions = false;
    vm.showTrigger = false;
    vm.showConditions = false;

    vm.$onInit = onInit;
    vm.back = back;
    vm.show = show;
    vm.executeActions = executeActions;
    vm.executeExitActions = executeExitActions;
    vm.remove = remove;

    function onInit() {
      $element.addClass('RuleDetails');

      if(!app.dataLoaded) {
        $state.go('guh.intro', {
          previousState: {
            name: $state.current.name,
            params: {
              ruleId: $stateParams.ruleId
            }
          }
        });
      } else {
        _initNavigation();
        _initActions();

        if(libs._.has($stateParams, 'ruleId') && $stateParams.ruleId) {
          rule = DSRule.get($stateParams.ruleId);
          _initRule(rule);
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
          label: 'Back to rules',
          callback: back
        },
        {
          position: 2,
          iconUrl: './assets/svg/ui/ui.symbol.svg#trash-a',
          label: 'Remove',
          callback: remove
        }
      ]);
    }

    function _initRule(rule) {
      vm.actions = rule.actions;
      vm.active = rule.active;
      vm.enabled = rule.enabled;
      vm.eventDescriptors = rule.eventDescriptors;
      vm.events = [];
      vm.exitActions = rule.exitActions;
      vm.id = rule.id;
      vm.name = rule.name;
      vm.stateEvaluator = rule.stateEvaluator;
      vm.states = [];

      // Event descriptors
      angular.forEach(vm.eventDescriptors, function(eventDescriptor) {
        vm.events.push(_createEvent(eventDescriptor));
      });

      // State evaluator
      if(angular.isDefined(vm.stateEvaluator) && angular.isDefined(vm.stateEvaluator.stateDescriptor)) {
        vm.states.push(_createState(vm.stateEvaluator.stateDescriptor));
      }
      angular.forEach(vm.stateEvaluator.childEvaluators, function(childEvaluator) {
        vm.states.push(_createState(childEvaluator.stateDescriptor));
      });

      // Enter actions
      angular.forEach(vm.actions, function(action, index) {
        var actionType = DSActionType.get(action.actionTypeId);
        var paramType;
        
        vm.actions[index].device = DSDevice.get(action.deviceId);
        vm.actions[index].actionType = actionType;
        vm.actions[index].device = DSDevice.get(action.deviceId);

        // RuleActionParams
        angular.forEach(action.ruleActionParams, function(ruleActionParam, index) {
          paramType = DSParamType.get(ruleActionParam.paramTypeId);

          ruleActionParam.name = paramType.name;
          ruleActionParam.unit = paramType.unit;

          if(angular.isUndefined(ruleActionParam.value)) {
            ruleActionParam.value = null;
          }

          if(angular.isDefined(ruleActionParam.eventTypeId)) {
            var eventType = DSEventType.get(ruleActionParam.eventTypeId);
            ruleActionParam.eventType = eventType;
          }
        });
      });

      // Exit actions
      angular.forEach(vm.exitActions, function(exitAction, index) {
        var actionType = DSActionType.get(exitAction.actionTypeId);
        var paramType;

        vm.exitActions[index].phrase = actionType.phrase;
        vm.exitActions[index].actionType = actionType;
        vm.exitActions[index].device = DSDevice.get(exitAction.deviceId);

        // RuleActionParams
        angular.forEach(exitAction.ruleActionParams, function(ruleActionParam, index) {
          paramType = DSParamType.get(ruleActionParam.paramTypeId);

          ruleActionParam.name = paramType.name;
          ruleActionParam.unit = paramType.unit;

          if(angular.isUndefined(ruleActionParam.value)) {
            ruleActionParam.value = null;
          }

          if(angular.isDefined(ruleActionParam.eventTypeId)) {
            var eventType = DSEventType.get(ruleActionParam.eventTypeId);
            ruleActionParam.eventType = eventType;
          }
        });
      });
    }

    function _createEvent(eventDescriptor) {
      var device = DSDevice.get(eventDescriptor.deviceId);
      var eventType = DSEventType.get(eventDescriptor.eventTypeId);

      vm.events.push({
        device: device,
        eventType: eventType,
        eventDescriptor: eventDescriptor
      });
    }

    function _createState(stateDescriptor) {
      var device = DSDevice.get(stateDescriptor.deviceId);
      var stateType = DSStateType.get(stateDescriptor.stateTypeId);

      vm.states.push({
        device: device,
        stateType: stateType,
        stateDescriptor: stateDescriptor
      });
    }

    function back() {
      $state.go('guh.rules');
    }

    function show(type) {
      switch(type) {
        case 'enterActions':
          vm.showEnterActions = true;
          vm.showExitActions = false;
          vm.showTrigger = false;
          vm.showConditions = false;
          break;
        case 'exitActions':
          vm.showEnterActions = false;
          vm.showExitActions = true;
          vm.showTrigger = false;
          vm.showConditions = false;
          break;
        case 'trigger':
          vm.showEnterActions = false;
          vm.showExitActions = false;
          vm.showTrigger = true;
          vm.showConditions = false;
          break;
        case 'conditions':
          vm.showEnterActions = false;
          vm.showExitActions = false;
          vm.showTrigger = false;
          vm.showConditions = true;
          break;
        default:
          if(vm.enterActions.length === 0) {
            return;
          }
          vm.showEnterActions = true;
          vm.showExitActions = false;
          vm.showTrigger = false;
          vm.showConditions = false;
          break;

      }
    }

    function executeActions() {
      rule
        .executeActions()
        .then(function(response) {
          $log.log('Actions successfully executed.', response);
        })
        .catch(function(error) {
          $log.error('Actions not executed', error);
        });
    }

    function executeExitActions() {
      rule
        .executeExitActions()
        .then(function(response) {
          $log.log('Actions successfully executed.', response);
        })
        .catch(function(error) {
          $log.error('Actions not executed', error);
        });
    }

    function remove() {
      rule
        .remove()
        .then(function() {})
        .catch(function(error) {
          $log.error('guh.moods.RuleDetailsCtrl:controller - ', error);
        });
    }

  }

}());
