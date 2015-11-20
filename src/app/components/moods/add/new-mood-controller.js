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

  NewMoodCtrl.$inject = ['$log', '$rootScope', 'app', 'DSDevice', 'DSActionType', 'DSEventType', 'DSStateType', 'DSRule'];

  function NewMoodCtrl($log, $rootScope, app, DSDevice, DSActionType, DSEventType, DSStateType, DSRule) {

    // View data
    var vm = this;
    vm.rule = {};
    vm.things = [];
    vm.selectedThing = {};
    vm.selectedAction = {};
    vm.selectedTrigger = {};

    // View methods
    vm.isActionType = isActionType;
    vm.isEventType = isEventType;
    vm.isStateType = isStateType;
    vm.selectThing = selectThing;
    vm.selectAction = selectAction;
    vm.selectActionDetails = selectActionDetails;
    vm.selectTrigger = selectTrigger;
    vm.selectTriggerDetails = selectTriggerDetails;
    vm.save = save;


    function _init() {
      vm.rule = {
        actions: [],
        // active: false,
        enabled: true,
        // eventDescriptors: [],
        executable: true,
        // exitActions: [],
        // id: null,
        // name: null,
        // stateEvaluator: {}
      };

      _setThings();
    }

    function _setThings() {
      vm.things = DSDevice.getAll();
    }

    function _addStateEvaluator(stateDescriptor) {
      var stateEvaluator = {
        operator: app.stateOperator.StateOperatorAnd,
        stateDescriptor: stateDescriptor
      };

      if(angular.isUndefined(vm.rule.stateEvaluator)) {
        vm.rule.stateEvaluator = stateEvaluator;
      } else {
        if(angular.isUndefined(vm.rule.stateEvaluator.childEvaluators)) {
          vm.rule.stateEvaluator.childEvaluators = [];
        }

        vm.rule.stateEvaluator.childEvaluators.push(stateEvaluator);
      }
    }


    function isActionType() {
      return DSActionType.is(vm.selectedAction);
    }

    function isEventType() {
      return DSEventType.is(vm.selectedTrigger);
    }

    function isStateType() {
      return DSStateType.is(vm.selectedTrigger);
    }

    function selectThing(thing) {
      $log.log('thing', thing);
      vm.selectedThing = thing;

      // Next step
      $rootScope.$broadcast('wizard.next', 'newMood');
    }

    function selectAction(action) {
      vm.selectedAction = null;
      vm.selectedAction = action;

      if(isActionType()) {
        $log.log('Action', action);

        if(action.paramTypes.length === 0) {
          $rootScope.$broadcast('wizard.prev', 'newMood');
        } else if(action.paramTypes.length > 0) {
          $rootScope.$broadcast('wizard.next', 'newMood');
        }        
      }
    }

    function selectActionDetails(params) {
      var ruleActionParams = vm.selectedAction.getRuleActionParams(params);
      $log.log('params', params);
      $log.log('ruleActionParams', ruleActionParams);
      var ruleAction = vm.selectedThing.getAction(vm.selectedAction, params);
      $log.log('ruleAction', ruleAction);
      vm.rule.actions.push(ruleAction);
      $rootScope.$broadcast('wizard.prev', 'newMood');
      $rootScope.$broadcast('wizard.prev', 'newMood');
    }

    function selectTrigger(trigger) {
      vm.selectedTrigger = null;
      vm.selectedTrigger = trigger;
      $log.log('TRIGGER', trigger);

      if(isEventType()) {
        if(trigger.paramTypes.length === 0) {
          $rootScope.$broadcast('wizard.prev', 'newMood');
        } else if(trigger.paramTypes.length > 0) {
          $rootScope.$broadcast('wizard.next', 'newMood');
        }
      } else if(isActionType()) {
        $log.log('NEXT');
        $rootScope.$broadcast('wizard.next', 'newMood');
      }
    }

    function selectTriggerDetails(paramDescriptors) {
      $log.log('selectTriggerDetails', paramDescriptors);

      if(isEventType()) {        
        if(angular.isUndefined(vm.rule.eventDescriptors)) {
          vm.rule.eventDescriptors = [];
        }

        vm.rule.eventDescriptors.push(vm.selectedThing.getEventDescriptor(vm.selectedTrigger, paramDescriptors));
      } else if(isStateType()) {
        angular.forEach(paramDescriptors, function(paramDescriptor) {
          var stateDescriptor = vm.selectedThing.getStateDescriptor(vm.selectedTrigger, paramDescriptor);
          _addStateEvaluator(stateDescriptor);

          // var stateDescriptor = {
          //   deviceId: vm.selectedThing.id,
          //   operator: paramDescriptor.operator,
          //   stateTypeId: vm.selectedTrigger.id,
          //   value: paramDescriptor.value
          // };

          // _addStateEvaluator(stateDescriptor);
        });
      }

      $rootScope.$broadcast('wizard.prev', 'newMood');
      $rootScope.$broadcast('wizard.prev', 'newMood');
    }

    function save() {
      DSRule
        .create(vm.rule)
        .then(function(rule) {
          $log.log('Mood was created.', rule);
        })
        .catch(function(error) {
          $log.log('guh.moods.NewMoodCtrl:controller | Error while saving mood.', error);
        });
    }


    _init();

  }

}());
