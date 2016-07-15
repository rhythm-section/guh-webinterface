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
 * @name guh.components.controller:AddActionCtrl
 *
 * @description
 * Add a new action to a rule.
 *
 */

(function() {
  'use strict';

  angular
    .module('guh.components')
    .controller('AddStateCtrl', AddStateCtrl);

  AddStateCtrl.$inject = ['app', '$filter', '$log', '$rootScope', 'DSDevice'];

  function AddStateCtrl(app, $filter, $log, $rootScope, DSDevice) {

    var vm = this;

    vm.things = [];
    vm.stateTypes = [];
    vm.currentThing = null;
    vm.currentStateType = null;

    vm.$onInit = $onInit;

    vm.selectThing = selectThing;
    vm.hasCurrentThing = hasCurrentThing;
    vm.selectStateType = selectStateType;
    vm.hasCurrentStateType = hasCurrentStateType;
    vm.addStateParams = addStateParams;


    function $onInit() {
      _setThings();
    }

    function _hasRuleRelevantStates(device) {
      var ruleRelevantStateTypes = [];

      if(angular.isDefined(device.deviceClass) && angular.isDefined(device.deviceClass.stateTypes)) {
        ruleRelevantStateTypes = device.deviceClass.stateTypes.filter(_isRuleRelevant);
      }

      if(ruleRelevantStateTypes.length === 0) {
        return false;
      }

      return true;
    }

    function _isRuleRelevant(stateType) {
      return angular.isUndefined(stateType.ruleRelevant) || stateType.ruleRelevant;
    }

    function _setThings() {
      var things = DSDevice.getAll();

      vm.currentThing = null;
      vm.things = things.filter(_hasRuleRelevantStates);
    }

    function _getParamDescriptor(name, operator, value) {
      return {
        name: name,
        operator: operator,
        value: value
      };
    }


    function selectThing(thing) {
      vm.currentThing = thing;
      vm.stateTypes = [];
      vm.currentStateType = null;

      // Filter states with value type of 'UnitUnixTime'
      // vm.stateTypes = vm.currentThing.deviceClass.stateTypesLinked.filter(function(stateType) {
      //   return stateType.unit !== 'UnitUnixTime';
      // });

      vm.stateTypes = vm.currentThing.deviceClass.stateTypesLinked.filter(_isRuleRelevant);

      $rootScope.$broadcast('wizard.next', 'addStateWizard');
    }

    function hasCurrentThing() {
      return vm.currentThing !== null;
    }

    function selectStateType(stateType) {
      vm.currentStateType = stateType;

      $rootScope.$broadcast('wizard.next', 'addStateWizard');
    }

    function hasCurrentStateType() {
      return vm.currentStateType !== null;
    }

    // function addStateParams(params) {
    function addStateParams(paramDescriptors, stateDescriptors, selectedValueOperator) {
      // var stateDescriptors = [];
      var title = '';
      var unit = vm.currentStateType.unit ? $filter('unit')(vm.currentStateType.unit) : '';
      
      if(angular.toJson(selectedValueOperator) === angular.toJson(app.valueOperator.between)) {
        title = '' + vm.currentStateType.name + ' ' + selectedValueOperator.label + ' ' + paramDescriptors[0].value + unit + ' and ' + paramDescriptors[1].value + unit;
      } else {
        title = '' + vm.currentStateType.name + ' ' + selectedValueOperator.label + ' ' + paramDescriptors[0].value + unit;
      }

      vm.modalInstance.close({
        thing: vm.currentThing,
        stateType: vm.currentStateType,
        stateDescriptors: stateDescriptors,
        title: title
      });
    }

  }

}());