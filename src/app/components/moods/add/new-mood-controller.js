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
 * @name guh.moods.controller:NewMoodCtrl
 *
 * @description
 * Add a new mood.
 *
 */

(function(){
  'use strict';

  angular
    .module('guh.moods')
    .controller('NewMoodCtrl', NewMoodCtrl);

  NewMoodCtrl.$inject = ['app', 'libs', '$log', '$rootScope', '$state', '$stateParams', 'MorphModal', 'DSRule', 'modalInstance'];

  function NewMoodCtrl(app, libs, $log, $rootScope, $state, $stateParams, MorphModal, DSRule, modalInstance) {

    var vm = this;
    var actionModal = null;
    var eventModal = null;
    var stateModal = null;
    var exitActionModal = null;

    vm.modalInstance = modalInstance;
    vm.rule = null;
    vm.actions = [];
    vm.events = [];
    vm.states = [];
    vm.exitActions = [];
    vm.exitActionsDisabled = false;

    vm.addAction = addAction;
    vm.deleteAction = deleteAction;
    vm.hasActions = hasActions;
    vm.addEvent = addEvent;
    vm.deleteEvent = deleteEvent;
    vm.addState = addState;
    vm.deleteState = deleteState;
    vm.addExitAction = addExitAction;
    vm.deleteExitAction = deleteExitAction;
    vm.hasExitActions = hasExitActions;
    vm.isDisabled = isDisabled;
    vm.enterRuleDetails = enterRuleDetails;
    vm.isValid = isValid;
    vm.setDetails = setDetails;

    vm.addModal = function() {
      MorphModal
        .add({
          controller: 'NewMoodCtrl',
          controllerAs: 'newMood',
          data: null,
          templateUrl: 'app/components/moods/add/new-mood-modal.html'
        })
        .then(function(modal) {
          $log.log('modal', modal);
          modal.open();
        })
        .catch(function(error) {
          $log.log('error', error);
        });
    };

    function _init() {
      vm.rule = {
        actions: [],
        enabled: true,
        executable: true,
        name: ''
      };
    }

    function _addModal(modalData) {
      MorphModal
        .add(modalData)
        .then(function(modal) {
          modal.open();
        })
        .catch(function(error) {
          $log.error(error);
        });
    }

    function _getStateEvaluator() {
      var stateEvaluator = {
        operator: app.stateOperator.StateOperatorAnd
      }

      angular.forEach(vm.states, function(state, index) {
        var stateDescriptor = state.stateDescriptor;

        if(index === 0) {
          stateEvaluator.stateDescriptor = stateDescriptor;
        } else {
          if(angular.isUndefined(stateEvaluator.childEvaluators)) {
            stateEvaluator.childEvaluators = [];
          }

          stateEvaluator.childEvaluators.push({
            operator: app.stateOperator.StateOperatorAnd,
            stateDescriptor: stateDescriptor
          });
        }
      });

      return stateEvaluator;
    }

    function _indexOf(objectToFind, array) {
      var index = -1;

      angular.forEach(array, function(currentObject, currentIndex) {
        if(angular.equals(currentObject, objectToFind)) {
          $log.log('Object found', objectToFind, array);
          index = currentIndex;
        }
      });

      return index;
    }


    function addAction() {
      var modalData = {
        controller: 'AddActionCtrl',
        controllerAs: 'addAction',
        data: null,
        templateUrl: app.basePaths.moods + 'add/add-action.html'
      };

      MorphModal
        .add(modalData)
        .then(function(modal) {
          modal.open();
          actionModal = modal;
        })
        .catch(function(error) {
          $log.error(error);
        });
    }

    function deleteAction(actionToDelete) {
      vm.actions.splice(_indexOf(actionToDelete, vm.actions), 1);
    }

    function hasActions() {
      return angular.isDefined(vm.actions) && angular.isArray(vm.actions) && vm.actions.length > 0;
    }

    function addEvent() {
      var modalData = {
        controller: 'AddEventCtrl',
        controllerAs: 'addEvent',
        data: null,
        templateUrl: app.basePaths.moods + 'add/add-event.html'
      };

      MorphModal
        .add(modalData)
        .then(function(modal) {
          modal.open();
          eventModal = modal;
        })
        .catch(function(error) {
          $log.error(error);
        });
    }

    function deleteEvent(eventToDelete) {
      vm.events.splice(_indexOf(eventToDelete, vm.events), 1);

      if(vm.events.length === 0) {
        vm.exitActionsDisabled = false;
      }
    }

    function hasEvents() {
      return angular.isDefined(vm.events) && angular.isArray(vm.events) && vm.events.length > 0;
    }

    function addState() {
      var modalData = {
        controller: 'AddStateCtrl',
        controllerAs: 'addState',
        data: null,
        templateUrl: app.basePaths.moods + 'add/add-state.html'
      };

      MorphModal
        .add(modalData)
        .then(function(modal) {
          modal.open();
          stateModal = modal;
        })
        .catch(function(error) {
          $log.error(error);
        });
    }

    function deleteState(stateToDelete) {
      vm.states.splice(_indexOf(stateToDelete, vm.states), 1);
    }

    function hasStates() {
      return angular.isDefined(vm.states) && angular.isArray(vm.states) && vm.states.length > 0;
    }

    function addExitAction() {
      if(vm.exitActionsDisabled) {
        return;
      }

      var modalData = {
        controller: 'AddActionCtrl',
        controllerAs: 'addAction',
        data: null,
        templateUrl: app.basePaths.moods + 'add/add-action.html'
      };

      MorphModal
        .add(modalData)
        .then(function(modal) {
          modal.open();
          exitActionModal = modal;
        })
        .catch(function(error) {
          $log.error(error);
        });
    }

    function deleteExitAction(actionToDelete) {
      vm.exitActions.splice(_indexOf(actionToDelete, vm.exitActions), 1);
    }

    function hasExitActions() {
      return angular.isDefined(vm.exitActions) && angular.isArray(vm.exitActions) && vm.exitActions.length > 0;
    }

    function isDisabled() {
      $log.log('isDisabled', hasEvents());
      if(hasEvents() && hasExitActions()) {
        return 'list__item_isDisabled';
      }

      return;
    }

    function isValid() {
      return hasActions() ||
             (hasActions() && hasEvents()) ||
             (hasActions() && hasEvents() && hasStates()) ||
             (hasActions() && hasStates() && hasExitActions());
    }

    function setDetails() {
      $rootScope.$broadcast('wizard.next', 'addRule');
    }

    function enterRuleDetails(params) {
      // Details
      var name = libs._.find(params, function(param) {
        return param.name === 'Name';
      });

      vm.rule.name = angular.isDefined(name) ? name.value : 'Mood';

      // Actions
      if(hasActions()) {
        vm.rule.actions = vm.actions.map(function(action) {
          return action.ruleAction;
        });
      }

      // EventDescriptors
      if(hasEvents()) {
        if(vm.events.length > 1) {
          vm.rule.eventDescriptorList = vm.events.map(function(eventItem) {
            return eventItem.eventDescriptor;
          });
        } else {
          vm.rule.eventDescriptor = vm.events[0].eventDescriptor;
        }
      }

      // StateEvaluator
      if(hasStates()) {
        vm.rule.stateEvaluator = _getStateEvaluator();
      }

      // ExitActions
      if(hasExitActions() && !hasEvents()) {
        vm.rule.exitActions = vm.exitActions.map(function(action) {
          return action.ruleAction;
        });
      }

      // Save
      DSRule
        .create(vm.rule)
        .then(function(rule) {
          modalInstance.close();
          $state.go('guh.moods.master', { bypassCache: true }, {
            reload: true,
            inherit: false,
            notify: true
          });
        });
    }


    $rootScope.$on('modals.close', function(event, modal, data) {
      $log.log('Event: modals.close', event, modal, data);

      if(data) {
        if(actionModal && modal.id === actionModal.id) {
          // Add actions
          vm.actions.push({
            thing: data.thing,
            actionType: data.actionType,
            ruleAction: data.ruleAction,
            params: data.params
          });
          // vm.rule.actions.push(data.ruleAction);
        } else if(eventModal && modal.id === eventModal.id) {
          // Add events
          vm.events.push({
            thing: data.thing,
            eventType: data.eventType,
            eventDescriptor: data.eventDescriptor
          });

          vm.exitActionsDisabled = true;
        } else if(stateModal && modal.id === stateModal.id) {
          // Add states
          vm.states.push({
            thing: data.thing,
            stateType: data.stateType,
            stateDescriptors: data.stateDescriptors,
            title: data.title
          });
        } else if(exitActionModal && modal.id === exitActionModal.id) {
          // Add exitActions
          vm.exitActions.push({
            thing: data.thing,
            actionType: data.actionType,
            ruleAction: data.ruleAction,
            params: data.params
          });
        }
      }
    });


    _init();

  }

}());
