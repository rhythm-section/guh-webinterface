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
    var isExitAction = false;

    vm.rule = {};
    vm.things = [];
    vm.selectedThing = {};
    vm.selectedAction = {};

    // View methods
    vm.isActionType = isActionType;
    vm.selectEnterAction = selectEnterAction;
    vm.selectExitAction = selectExitAction;
    vm.selectActionDetails = selectActionDetails;
    vm.save = save;


    function _init() {
      vm.rule = {
        actions: [],
        enabled: true,
        executable: true,
        exitActions: [],
        name: ''
      };

      _setThings();
    }

    function _setThings() {
      var devices = DSDevice.getAll();
      vm.things = devices.filter(_hasActions);
    }

    function _hasActions(device) {
      return angular.isDefined(device.deviceClass) && device.deviceClass.actionTypes.length > 0;
    }

    function _selectAction(thing, action) {
      vm.selectedThing = thing;
      vm.selectedAction = action;

      if(isActionType()) {
        if(action.paramTypes.length === 0) {
          var ruleAction = vm.selectedThing.getAction(vm.selectedAction, []);
          
          $log.log('isExitAction', isExitAction);

          if(isExitAction) {
            vm.rule.exitActions.push(ruleAction);
            $rootScope.$broadcast('wizard.prev', 'exitActions');
          } else {
            vm.rule.actions.push(ruleAction);
            $rootScope.$broadcast('wizard.prev', 'enterActions');
          }
          
          vm.selectedAction = null;
        } else {
          if(isExitAction) {
            $rootScope.$broadcast('wizard.next', 'exitActions');
          } else {
            $rootScope.$broadcast('wizard.next', 'enterActions');
          }
        }    
      }
    }

    function isActionType() {
      return DSActionType.is(vm.selectedAction);
    }

    function selectEnterAction(thing, enterAction) {
      isExitAction = false;
      _selectAction(thing, enterAction);
    }

    function selectExitAction(thing, enterAction) {
      isExitAction = true;
      _selectAction(thing, enterAction);
    }

    function selectActionDetails(params) {
      var ruleActionParams = vm.selectedAction.getRuleActionParams(params);
      var ruleAction = vm.selectedThing.getAction(vm.selectedAction, params);

      if(isExitAction) {
        vm.rule.exitActions.push(ruleAction);
        $rootScope.$broadcast('wizard.prev', 'exitActions');
      } else {
        vm.rule.actions.push(ruleAction);
        $rootScope.$broadcast('wizard.prev', 'enterActions');
      }
      
      vm.selectedAction = null;
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
