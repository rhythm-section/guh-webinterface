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
 * @name guh.moods.controller:AddStateCtrl
 *
 * @description
 * Add a new state to a rule.
 *
 */

(function(){
  'use strict';

  angular
    .module('guh.components')
    .controller('AddStateCtrl', AddStateCtrl);

  AddStateCtrl.$inject = ['app', '$filter', '$log', '$rootScope', 'DSDevice', 'modalInstance'];

  function AddStateCtrl(app, $filter, $log, $rootScope, DSDevice, modalInstance) {

    var vm = this;

    vm.modalInstance = modalInstance;
    vm.things = [];
    vm.stateTypes = [];
    vm.currentThing = null;
    vm.currentStateType = null;
    vm.availableValueOperators = [];
    vm.isSingleValueOperator = true;
    vm.selectedValueOperator = app.valueOperator.is;
    vm.isStateType = null;
    vm.fromStateType = null;
    vm.toStateType = null;

    vm.selectThing = selectThing;
    vm.hasCurrentThing = hasCurrentThing;
    vm.selectStateType = selectStateType;
    vm.hasCurrentStateType = hasCurrentStateType;
    vm.addStateParams = addStateParams;
    vm.selectValueOperator = selectValueOperator;


    function _init() {
      _setThings();
    }

    function _hasEvents(device) {
      return angular.isDefined(device.deviceClass) &&
             angular.isDefined(device.deviceClass.stateTypes) &&
             device.deviceClass.stateTypes.length > 0;
    }

    function _setThings() {
      var things = DSDevice.getAll();

      vm.currentThing = null;
      vm.things = things.filter(_hasEvents);
    }

    function _setAvailableValueOperators() {
      switch(vm.currentStateType.type) {
        case 'Bool':
          vm.availableValueOperators = [
            app.valueOperator.is
          ];
          break;
        case 'String':
          vm.availableValueOperators = [
            app.valueOperator.is
          ];
          break;
        case 'Int':
        case 'Uint':
        case 'Double':
          vm.availableValueOperators = [
            app.valueOperator.is,
            app.valueOperator.isNot,
            app.valueOperator.isGreaterThan,
            app.valueOperator.isLessThan,
            app.valueOperator.between
          ];
          break;
      }
    }

    function _getParamDescriptor(name, operator, value) {
      return {
        name: name,
        operator: operator,
        value: value
      }
    }


    function selectThing(thing) {
      vm.currentThing = thing;
      vm.stateTypes = [];
      vm.currentStateType = null;

      // Filter states with value type of 'UnitUnixTime'
      vm.stateTypes = vm.currentThing.deviceClass.stateTypesLinked.filter(function(stateType) {
        return stateType.unit !== 'UnitUnixTime';
      });

      $rootScope.$broadcast('wizard.next', 'addStateWizard');
    }

    function hasCurrentThing() {
      return vm.currentThing !== null;
    }

    function selectStateType(stateType) {
      vm.currentStateType = stateType;

      _setAvailableValueOperators();
      vm.selectValueOperator();

      $rootScope.$broadcast('wizard.next', 'addStateWizard');
    }

    function hasCurrentStateType() {
      return vm.currentStateType !== null;
    }

    function addStateParams(params) {
      var stateDescriptors = [];
      var title = '';
      var unit = vm.currentStateType.unit ? $filter('unit')(vm.currentStateType.unit) : '';
      
      if(angular.toJson(vm.selectedValueOperator) === angular.toJson(app.valueOperator.between)) {
        if(params.length !== 2) {
          $log.error('guh.moods.controller:AddStateCtrl', 'Wrong number of params. For "between" operator 2 params are needed.');
          return;
        }

        var paramDescriptorSmall = {};
        var paramDescriptorLarge = {};

        if(parseInt(params[1].value) > parseInt(params[0].value)) {
          $log.log(params[1].value + '>' + params[0].value, parseInt(params[1].value) > parseInt(params[0].value));
          paramDescriptorSmall = _getParamDescriptor(params[0].name, vm.selectedValueOperator.operators[0], params[0].value);
          paramDescriptorLarge = _getParamDescriptor(params[1].name, vm.selectedValueOperator.operators[1], params[1].value);
        } else {
          $log.log(params[1].value + '<=' + params[0].value, parseInt(params[1].value) <= parseInt(params[0].value));
          paramDescriptorSmall = _getParamDescriptor(params[1].name, vm.selectedValueOperator.operators[0], params[1].value);
          paramDescriptorLarge = _getParamDescriptor(params[0].name, vm.selectedValueOperator.operators[1], params[0].value);
        }

        stateDescriptors.push(vm.currentThing.getStateDescriptor(vm.currentStateType, paramDescriptorSmall));
        stateDescriptors.push(vm.currentThing.getStateDescriptor(vm.currentStateType, paramDescriptorLarge));
        title = '' + vm.currentStateType.name + ' ' + vm.selectedValueOperator.label + ' ' + paramDescriptorSmall.value + unit + ' and ' + paramDescriptorLarge.value + unit;
      } else {
        if(params.length !== 1) {
          $log.error('guh.moods.controller:AddStateCtrl', 'Wrong number of params. For "' + vm.selectedValueOperator.label + '" operator 1 param is needed.');
          return;
        }

        var paramDescriptor = _getParamDescriptor(params[0].name, vm.selectedValueOperator.operators[0], params[0].value);
        stateDescriptors.push(vm.currentThing.getStateDescriptor(vm.currentStateType, paramDescriptor));
        title = '' + vm.currentStateType.name + ' ' + vm.selectedValueOperator.label + ' ' + params[0].value + unit;
      }

      modalInstance.close({
        thing: vm.currentThing,
        stateType: vm.currentStateType,
        stateDescriptors: stateDescriptors,
        title: title
      });
    }

    function selectValueOperator() {
      // Reset
      vm.isStateType = null;
      vm.fromStateType = null;
      vm.toStateType = null;

      if(angular.toJson(vm.selectedValueOperator) === angular.toJson(app.valueOperator.between)) {
        vm.isStateType = null;

        vm.fromStateType = angular.copy(vm.selectedValueOperator);
        vm.fromStateType.stateType = angular.copy(vm.currentStateType);
        vm.fromStateType.operator = angular.copy(vm.selectedValueOperator.operators[0]);

        vm.toStateType = angular.copy(vm.selectedValueOperator);
        vm.toStateType.stateType = angular.copy(vm.currentStateType);
        vm.toStateType.operator = angular.copy(vm.selectedValueOperator.operators[1]);
      } else {
        vm.isStateType = angular.copy(vm.selectedValueOperator);
        vm.isStateType.stateType = angular.copy(vm.currentStateType);
        vm.isStateType.operator = angular.copy(vm.selectedValueOperator.operators[0]);

        vm.fromStateType = null;
        vm.toStateType = null;
      }
    }


    _init();

  }

}());