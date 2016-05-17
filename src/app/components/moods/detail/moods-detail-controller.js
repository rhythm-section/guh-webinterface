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
 * @name guh.moods.controller:MoodsDetailCtrl
 *
 * @description
 * Load and show details of certain mood.
 *
 */

(function(){
  'use strict';

  angular
    .module('guh.moods')
    .controller('MoodsDetailCtrl', MoodsDetailCtrl);

  MoodsDetailCtrl.$inject = ['$log', 'app', '$state', '$stateParams', 'DSRule', 'DSDevice', 'DSEventType', 'DSStateType', 'DSActionType'];

  function MoodsDetailCtrl($log, app, $state, $stateParams, DSRule, DSDevice, DSEventType, DSStateType, DSActionType) {

    var vm = this;
    var mood = {};

    // Public variables
    vm.triggerModal = null;

    // Public methods
    vm.executeActions = executeActions;
    vm.executeExitActions = executeExitActions;

    function _init() {
      var moodId = $stateParams.moodId;

      if(angular.isUndefined(moodId)) {
        $state.go('guh.moods.master');
        return;
      }

      if(!app.dataLoaded) {
        $state.go('guh.intro', {
          previousState: {
            name: $state.current.name,
            params: $stateParams
          }
        });
      } else {
        mood = DSRule.get(moodId);

        vm.actions = mood.actions;
        vm.active = mood.active;
        vm.enabled = mood.enabled;
        vm.eventDescriptors = mood.eventDescriptors;
        vm.events = [];
        vm.exitActions = mood.exitActions;
        vm.id = mood.id;
        vm.name = mood.name;
        vm.stateEvaluator = mood.stateEvaluator;
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
          
          vm.actions[index].device = DSDevice.get(action.deviceId);
          vm.actions[index].actionType = actionType;
          vm.actions[index].device = DSDevice.get(action.deviceId);

          // RuleActionParams
          angular.forEach(action.ruleActionParams, function(ruleActionParam, index) {
            if(angular.isDefined(actionType.paramTypes[index])) {
              ruleActionParam.unit = actionType.paramTypes[index].unit;
            }

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

          vm.exitActions[index].phrase = actionType.phrase;
          vm.exitActions[index].actionType = actionType;
          vm.exitActions[index].device = DSDevice.get(exitAction.deviceId);

          // RuleActionParams
          angular.forEach(exitAction.ruleActionParams, function(ruleActionParam, index) {
            if(angular.isDefined(actionType.paramTypes[index])) {
              ruleActionParam.unit = actionType.paramTypes[index].unit;
            }

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


    function executeActions() {
      mood
        .executeActions()
        .then(function(response) {
          $log.log('Actions successfully executed.', response);
        })
        .catch(function(error) {
          $log.log('Actions not executed', error);
        });
    }

    function executeExitActions() {
      mood
        .executeExitActions()
        .then(function(response) {
          $log.log('Actions successfully executed.', response);
        })
        .catch(function(error) {
          $log.log('Actions not executed', error);
        });
    }


    _init();

  }

}());
