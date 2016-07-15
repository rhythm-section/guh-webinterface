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
    .controller('AddRuleCtrl', AddRuleCtrl);

  AddRuleCtrl.$inject = ['app', 'libs', '$log', '$rootScope', '$state', '$stateParams', 'ModalContainer', 'DSRule'];

  /**
   * @ngdoc controller
   * @name guh.containers.controller:AddRuleCtrl
   * @description Container component for adding a new thing.
   *
   */
  function AddRuleCtrl(app, libs, $log, $rootScope, $state, $stateParams, ModalContainer, DSRule) {
    
    var vm = this;
    var actionModal = null;
    var eventModal = null;
    var stateModal = null;
    var exitActionModal = null;

    vm.rule = null;
    vm.actions = [];
    vm.events = [];
    vm.states = [];
    vm.exitActions = [];
    vm.exitActionsDisabled = false;

    vm.$onInit = $onInit;

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
    vm.setRuleName = setRuleName;
    vm.enterRuleDetails = enterRuleDetails;
    vm.isValid = isValid;
    vm.setDetails = setDetails;


    function $onInit() {
      vm.rule = {
        actions: [],
        enabled: true,
        executable: true,
        name: ''
      };
    }


    function _addModal(modalData) {
      ModalContainer
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
      };

      var stateDescriptors = [];
      angular.forEach(vm.states, function(state) {
        stateDescriptors = stateDescriptors.concat(state.stateDescriptors);
      });
      
      angular.forEach(stateDescriptors, function(stateDescriptor, index) {
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
          index = currentIndex;
        }
      });

      return index;
    }


    function addAction() {
      ModalContainer
        .add({
          controller: ['modalInstance', function(modalInstance) {
            this.modalInstance = modalInstance;
          }],
          controllerAs: 'modal',
          data: null,
          template: '<guh-add-action modal-instance="modal.modalInstance"></guh-add-action>'
        })
        .then(function(modal) {
          modal.open();
          actionModal = modal;
        })
        .catch(function(error) {
          $log.error('error', error);
        });
    }

    function deleteAction(actionToDelete) {
      vm.actions.splice(_indexOf(actionToDelete, vm.actions), 1);
    }

    function hasActions() {
      return angular.isDefined(vm.actions) && angular.isArray(vm.actions) && vm.actions.length > 0;
    }

    function addEvent() {
      ModalContainer
        .add({
          controller: ['modalInstance', function(modalInstance) {
            this.modalInstance = modalInstance;
          }],
          controllerAs: 'modal',
          data: null,
          template: '<guh-add-event modal-instance="modal.modalInstance"></guh-add-event>'
        })
        .then(function(modal) {
          modal.open();
          eventModal = modal;
        })
        .catch(function(error) {
          $log.error('error', error);
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
      ModalContainer
        .add({
          controller: ['modalInstance', function(modalInstance) {
            this.modalInstance = modalInstance;
          }],
          controllerAs: 'modal',
          data: null,
          template: '<guh-add-state modal-instance="modal.modalInstance"></guh-add-state>'
        })
        .then(function(modal) {
          modal.open();
          stateModal = modal;
        })
        .catch(function(error) {
          $log.error('error', error);
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

      ModalContainer
        .add({
          controller: ['modalInstance', function(modalInstance) {
            this.modalInstance = modalInstance;
          }],
          controllerAs: 'modal',
          data: null,
          template: '<guh-add-action modal-instance="modal.modalInstance"></guh-add-action>'
        })
        .then(function(modal) {
          modal.open();
          exitActionModal = modal;
        })
        .catch(function(error) {
          $log.error('error', error);
        }); 
    }

    function deleteExitAction(actionToDelete) {
      vm.exitActions.splice(_indexOf(actionToDelete, vm.exitActions), 1);
    }

    function hasExitActions() {
      return angular.isDefined(vm.exitActions) && angular.isArray(vm.exitActions) && vm.exitActions.length > 0;
    }

    function isDisabled() {
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

    function setRuleName(name) {
      vm.rule.name = name;
    }

    function enterRuleDetails(params) {
      // Actions
      if(hasActions()) {
        vm.rule.actions = vm.actions.map(function(action) {
          return action.ruleAction;
        });
      }

      // EventDescriptors
      if(hasEvents()) {
        vm.rule.eventDescriptors = vm.events.map(function(eventItem) {
          return eventItem.eventDescriptor;
        });
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
        .add(vm.rule)
        .then(function() {
          /* jshint unused:true */
          vm.modalInstance.close();
        });
    }


    $rootScope.$on('modals.close', function(event, modal, data) {
      var enhancedParams;

      if(data) {
        if(actionModal && modal.id === actionModal.id) {
          enhancedParams = angular.copy(data.params);

          angular.forEach(data.params, function(param, index) {
            var paramType = libs._.find(data.actionType.paramTypes, function(paramType) {
              return paramType.name === param.name;
            });

            enhancedParams[index].unit = paramType.unit;
          });

          // Add actions
          vm.actions.push({
            thing: data.thing,
            actionType: data.actionType,
            ruleAction: data.ruleAction,
            params: data.params,
            enhancedParams: enhancedParams
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
          enhancedParams = angular.copy(data.params);

          angular.forEach(data.params, function(param, index) {
            var paramType = libs._.find(data.actionType.paramTypes, function(paramType) {
              return paramType.name === param.name;
            });

            enhancedParams[index].unit = paramType.unit;
          });

          // Add exitActions
          vm.exitActions.push({
            thing: data.thing,
            actionType: data.actionType,
            ruleAction: data.ruleAction,
            params: data.params,
            enhancedParams: enhancedParams
          });
        }
      }
    });

  }

}());
