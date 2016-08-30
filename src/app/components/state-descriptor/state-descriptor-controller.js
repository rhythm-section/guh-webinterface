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
    .module('guh.components')
    .controller('StateDescriptorCtrl', StateDescriptorCtrl);

  StateDescriptorCtrl.$inject = ['app', '$log', '$element'];

  /**
   * @ngdoc controller
   * @name guh.components.controller:StateDescriptorCtrl
   * @description Presentational component for a single param.
   *
   */
  function StateDescriptorCtrl(app, $log, $element) {
    
    var vm = this;

    vm.availableValueOperators = [];
    vm.selectedValueOperator = app.valueOperator.is;
    vm.descriptors = [];

    vm.$onInit = $onInit;
    vm.$onChanges = $onChanges;

    vm.selectValueOperator = selectValueOperator;
    vm.updateDescriptors = updateDescriptors;
    vm.submitStateDescriptors = submitStateDescriptors;


    function $onInit() {
      $element.addClass('StateType');

      var check = _checkProps();

      if(check) {
        vm.availableValueOperators = _getAvailableValueOperators(vm.stateType);
        vm.selectValueOperator(vm.selectedValueOperator);
      }
    }

    function $onChanges(changesObj) {
      if(angular.isDefined(changesObj.stateType) && angular.isDefined(changesObj.stateType.currentValue)) {
        vm.availableValueOperators = _getAvailableValueOperators(changesObj.stateType.currentValue);
        vm.selectValueOperator(vm.selectedValueOperator);
      }
    }


    function _checkProps() {
      if(angular.isUndefined(vm.thing)) {
        $log.error('guh.components.controller:StateDescriptorCtrl', 'Missing property: thing');
        return false;
      }

      if(angular.isUndefined(vm.stateType)) {
        $log.error('guh.components.controller:StateDescriptorCtrl', 'Missing property: stateType');
        return false;
      }

      return true;
    }

    function _getAvailableValueOperators(stateType) {
      var availableValueOperators = [];

      switch(stateType.type) {
        case 'Bool':
          availableValueOperators = [
            app.valueOperator.is
          ];
          break;
        case 'String':
          availableValueOperators = [
            app.valueOperator.is
          ];
          break;
        case 'Int':
        case 'Uint':
        case 'Double':
          availableValueOperators = [
            app.valueOperator.is,
            app.valueOperator.isNot,
            app.valueOperator.isGreaterThan,
            app.valueOperator.isLessThan,
            app.valueOperator.between
          ];
          break;
      }

      return availableValueOperators;
    }

    function _getDescriptors() {
      var descriptors = [];

      if(vm.isStateType) {
        descriptors.push(_getDescriptor(vm.isStateType));
      } else if(vm.fromStateType && vm.toStateType) {
        descriptors.push(_getDescriptor(vm.fromStateType));
        descriptors.push(_getDescriptor(vm.toStateType));
      }

      return descriptors;
    }

    function _getDescriptor(stateType) {
      return {
        paramDescriptor: {
          name: stateType.stateType.name,
          operator: stateType.operator,
          value: stateType.stateType.defaultValue ? stateType.stateType.defaultValue : undefined
        },

        stateDescriptor: {
          deviceId: vm.thing.id,
          operator: stateType.operator,
          stateTypeId: stateType.stateType.id,
          value: stateType.stateType.defaultValue ? stateType.stateType.defaultValue : undefined
        }
      };
    }


    function selectValueOperator(valueOperator) {
      // Reset
      vm.isStateType = null;
      vm.fromStateType = null;
      vm.toStateType = null;

      if(angular.toJson(valueOperator) === angular.toJson(app.valueOperator.between)) {
        vm.fromStateType = {
          stateType: angular.copy(vm.stateType),
          operator: angular.copy(valueOperator.operators[0])
        };

        vm.toStateType = {
          stateType: angular.copy(vm.stateType),
          operator: angular.copy(valueOperator.operators[1])
        };
      } else {
        vm.isStateType = {
          stateType: angular.copy(vm.stateType),
          operator: angular.copy(valueOperator.operators[0])
        };
      }

      vm.descriptors = _getDescriptors();
    }

    function updateDescriptors(type, defaultValue, value) {
      if(type === 'is') {
        vm.descriptors[0].paramDescriptor.defaultValue = defaultValue;
        vm.descriptors[0].paramDescriptor.value = value;
        vm.descriptors[0].stateDescriptor.defaultValue = defaultValue;
        vm.descriptors[0].stateDescriptor.value = value;
        vm.isStateType.value = value;
      } else if(type === 'from') {
        vm.descriptors[0].paramDescriptor.defaultValue = defaultValue;
        vm.descriptors[0].paramDescriptor.value = value;
        vm.descriptors[0].stateDescriptor.defaultValue = defaultValue;
        vm.descriptors[0].stateDescriptor.value = value;
        vm.fromStateType.value = value;
      } else if(type === 'to') {
        vm.descriptors[1].paramDescriptor.defaultValue = defaultValue;
        vm.descriptors[1].paramDescriptor.value = value;
        vm.descriptors[1].stateDescriptor.defaultValue = defaultValue;
        vm.descriptors[1].stateDescriptor.value = value;
        vm.toStateType.value = value;
      }
    }

    function submitStateDescriptors(isValid, descriptorsArray) {
      var paramDescriptors = [];
      var stateDescriptors = [];

      angular.forEach(descriptorsArray, function(descriptors) {
        // Set default value is no value is set
        if(descriptors.paramDescriptor.value === '' && angular.isDefined(descriptors.paramDescriptor.defaultValue)) {
          descriptors.paramDescriptor.value = descriptors.paramDescriptor.defaultValue;
        }

        if(descriptors.stateDescriptor.value === '' && angular.isDefined(descriptors.stateDescriptor.defaultValue)) {
          descriptors.stateDescriptor.value = descriptors.stateDescriptor.defaultValue;
        }

        // Remove default value (not part of a paramDescriptor or stateDescriptor)
        if(angular.isDefined(descriptors.paramDescriptor.defaultValue)) {
          delete descriptors.paramDescriptor.defaultValue;
        }

        if(angular.isDefined(descriptors.stateDescriptor.defaultValue)) {
          delete descriptors.stateDescriptor.defaultValue;
        }
        
        delete descriptors.stateDescriptor.defaultValue;

        paramDescriptors.push(descriptors.paramDescriptor);
        stateDescriptors.push(descriptors.stateDescriptor);
      });

      vm.onSubmit({
        paramDescriptors: paramDescriptors,
        stateDescriptors: stateDescriptors,
        selectedValueOperator: vm.selectedValueOperator
      });
    }

  }

}());
