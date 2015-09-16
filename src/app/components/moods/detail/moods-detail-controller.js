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

  MoodsDetailCtrl.$inject = ['$log', 'app', '$state', '$stateParams', 'ngDialog', 'DSRule', 'DSDevice', 'DSEventType', 'DSStateType', 'DSActionType'];

  function MoodsDetailCtrl($log, app, $state, $stateParams, ngDialog, DSRule, DSDevice, DSEventType, DSStateType, DSActionType) {

    var vm = this;
    var mood = {};

    // Public variables
    vm.triggerModal = null;

    // Public methods
    vm.addTrigger = addTrigger;
    vm.remove = remove;

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
        vm.exitActions = mood.exitActions;
        vm.id = mood.id;
        vm.name = mood.name;
        vm.stateEvaluator = mood.stateEvaluator;

        // Event descriptors
        angular.forEach(vm.eventDescriptors, function(eventDescriptor, index) {
          var eventType = DSEventType.get(eventDescriptor.eventTypeId);
          vm.eventDescriptors[index].phrase = eventType.phrase;
        });

        // State evaluator
        if(angular.isDefined(vm.stateEvaluator) && angular.isDefined(vm.stateEvaluator.stateDescriptor)) {
          var stateType = DSStateType.get(vm.stateEvaluator.stateDescriptor.stateTypeId);
          vm.stateEvaluator.stateDescriptor.phrase = stateType.phrase;
        }
        angular.forEach(vm.stateEvaluator.childEvaluators, function(childEvaluator, index) {
          if(angular.isDefined(childEvaluator.stateDescriptor)) {
            var stateType = DSStateType.get(childEvaluator.stateDescriptor.stateTypeId);
            vm.stateEvaluator.childEvaluators[index].stateDescriptor.phrase = stateType.phrase;
          }
        });

        // Enter actions
        angular.forEach(vm.actions, function(action, index) {
          var actionType = DSActionType.get(action.actionTypeId);
          
          vm.actions[index].phrase = actionType.phrase;

          // RuleActionParams
          angular.forEach(action.ruleActionParams, function(ruleActionParam) {
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

          // RuleActionParams
          angular.forEach(exitAction.ruleActionParams, function(ruleActionParam) {
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

    function addTrigger() {
      vm.triggerModal = ngDialog.open({
        className: 'modal',
        controller: 'AddTriggerCtrl',
        controllerAs: 'addTrigger',
        overlay: true,
        showClose: false,
        template: 'app/components/moods/detail/add-trigger.html'
      });
    }

    function remove() {
      // Remove rule and associated mood-toggle device
    }


    _init();

  }

}());
