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
 * @name guh.moods.controller:AddActionCtrl
 *
 * @description
 * Add a new action to a rule.
 *
 */

(function(){
  'use strict';

  angular
    .module('guh.components')
    .controller('AddActionCtrl', AddActionCtrl);

  AddActionCtrl.$inject = ['libs', '$q', '$timeout', '$log', '$rootScope', 'DSDevice', 'modalInstance'];

  function AddActionCtrl(libs, $q, $timeout, $log, $rootScope, DSDevice, modalInstance) {

    var vm = this;

    vm.modalInstance = modalInstance;
    vm.things = [];
    vm.currentThing = null;
    vm.currentActionType = null;
    vm.currentState = null;

    vm.selectThing = selectThing;
    vm.hasCurrentThingSet = hasCurrentThingSet;
    vm.selectActionType = selectActionType;
    vm.hasCurrentActionType = hasCurrentActionType;
    vm.addActionParams = addActionParams;


    function _init() {
      _setThings();
    }

    function _hasActions(device) {
      return angular.isDefined(device.deviceClass) &&
             angular.isDefined(device.deviceClass.actionTypes) &&
             device.deviceClass.actionTypes.length > 0;
    }

    function _setThings() {
      var things = DSDevice.getAll();
      vm.things = things.filter(_hasActions);
    }


    function selectThing(thing) {
      vm.currentThing = thing;
      $rootScope.$broadcast('wizard.next', 'addAction');
    }

    function hasCurrentThingSet() {
      return vm.currentThing !== null;
    }

    function selectActionType(actionType) {
      vm.currentActionType = actionType;

      if(actionType.hasState) {
        vm.currentState = libs._.find(vm.currentThing.deviceClass.stateTypes, function(stateType) {
          return stateType.id === actionType.id;
        });
      } else {
        vm.currentState = null;
      }

      $rootScope.$broadcast('wizard.next', 'addAction');
    }

    function hasCurrentActionType() {
      return vm.currentActionType !== null;
    }

    function addActionParams(params) {
      var ruleAction = vm.currentThing.getAction(vm.currentActionType, params);
      modalInstance.close({
        thing: vm.currentThing,
        actionType: vm.currentActionType,
        params: params,
        ruleAction: ruleAction
      });
    }


    _init();

  }

}());