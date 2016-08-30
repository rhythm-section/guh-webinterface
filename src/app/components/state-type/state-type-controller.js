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
    .controller('StateTypeCtrl', StateTypeCtrl);

  StateTypeCtrl.$inject = ['app', '$log', '$element'];

  /**
   * @ngdoc controller
   * @name guh.components.controller:StateTypeCtrl
   * @description Presentational component for a single param.
   *
   */
  function StateTypeCtrl(app, $log, $element) {
    
    var vm = this;

    vm.$onInit = $onInit;
    vm.$onChanges = $onChanges;

    vm.setParam = setParam;


    function $onInit() {
      $element.addClass('StateType');

      var check = _checkProps();

      if(check) {
        vm.component = _getStateComponent(vm.stateType);
      }
    }

    function $onChanges(changesObj) {
      if(angular.isDefined(changesObj.stateType) && angular.isDefined(changesObj.stateType.currentValue)) {
        vm.component = _getStateComponent(changesObj.stateType.currentValue);
        vm.setParam(vm.component.bindings.name, vm.component.bindings.value);
      }

      if(angular.isDefined(changesObj.value) && angular.isDefined(changesObj.value.currentValue)) {
        vm.component.bindings.value = changesObj.value.currentValue;
        vm.setParam(vm.component.bindings.name, vm.component.bindings.value);
      }
    }


    function _checkProps() {
      if(angular.isUndefined(vm.stateType)) {
        $log.error('guh.components.controller:StateTypeCtrl', 'Missing property: stateType');
        return false;
      }

      return true;
    }

    function _getStateComponent(stateType) {
      var component = {
        selector: '',
        bindings: {
          name: stateType.name ? stateType.name : undefined,
          required: angular.isDefined(stateType.defaultValue) ? false : true,
          value: angular.isDefined(stateType.value) ? stateType.value : (angular.isDefined(stateType.defaultValue) ? stateType.defaultValue : undefined)
        }
      };

      // See following link for more info: http://dev.guh.guru/stateTypes-ui-elements.html
      if(angular.isDefined(stateType.type)) {
        switch(stateType.type) {
          case app.basicTypes.bool:
            component.selector = 'guh-checkbox';
            component.bindings.label = stateType.name;
            component.bindings.required = false;
            break;
          case app.basicTypes.string:
            if(angular.isDefined(stateType.inputType)) {
              if(stateType.inputType === app.inputTypes.textArea) {
                component.selector = 'guh-text-area';
                component.bindings.label = stateType.name;
              } else {
                component.selector = 'guh-text-input';
                component.bindings.label = stateType.name;
                component.bindings.type = stateType.inputType;
                component.bindings.unit = stateType.unit;
              }
            } else if(angular.isDefined(stateType.allowedValues)) {
              component.selector = 'guh-select';
              component.bindings.label = stateType.name;
              component.bindings.options = stateType.allowedValues;
            } else if(angular.isDefined(stateType.possibleValues)) {
              component.selector = 'guh-select';
              component.bindings.label = stateType.name;
              component.bindings.options = stateType.possibleValues;
            } else {
              component.selector = 'guh-text-input';
              component.bindings.label = stateType.name;
              component.bindings.unit = stateType.unit;
            }
            break;
          case app.basicTypes.time:
            component = 'guh-time';
            component.bindings.required = false;
            break;
          case app.basicTypes.int:
          case app.basicTypes.unsignedInt:
          case app.basicTypes.double:
            if(angular.isDefined(stateType.unit) && stateType.unit === 'UnitUnixTime') {
              component.selector = 'guh-date-time';
              component.bindings.required = false;
            } else {
              if(angular.isDefined(stateType.minValue) && angular.isDefined(stateType.maxValue)) {
                component.selector = 'guh-slider';
                component.bindings.minValue = stateType.minValue;
                component.bindings.maxValue = stateType.maxValue;
                component.bindings.label = stateType.name;
                component.bindings.required = false;
              } else {
                component.selector = 'guh-text-input';
                component.bindings.label = stateType.name;
                component.bindings.type = stateType.type;
                component.bindings.unit = stateType.unit;
              }
            }
            break;
          case app.basicTypes.color:
            component.selector = 'guh-color';
            component.bindings.required = false;
            break;
        }
      } else {
        $log.error('guh.components.controller:StateTypeCtrl', 'Missing property: type');
      }

      // Mark param component as required (useful for stateTypeList)
      if(component.bindings.required) {
        vm.onRequired({
          paramComponent: component
        });
      }

      return component;
    }


    function setParam(name, value) {
      vm.onChange({
        name: name,
        value: value
      });
    }

  }

}());
