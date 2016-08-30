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
    .module('guh.ui')
    .controller('TextInputCtrl', TextInputCtrl);

  TextInputCtrl.$inject = ['app', 'libs', '$log', '$filter'];

  function TextInputCtrl(app, libs, $log, $filter) {
    
    var vm = this;

    var invokeWait = 600;
    var invokeOptions = {
      leading: false,
      trailing: true
    };
    var debounce = libs._.throttle(vm.onChange, invokeWait, invokeOptions);

    vm.validationData = {
      pattern: undefined,
      errorText: 'Field is not valid.'
    };

    vm.$onInit = $onInit;
    vm.$onChanges = $onChanges;

    vm.setValue = setValue;


    function $onInit() {
      var check = _checkProps();

      if(check) {
        vm.validationData = _getValidationData(vm.type);
      }
    }

    function $onChanges(changesObj) {
      if(angular.isDefined(changesObj.value && angular.isDefined(changesObj.value.currentValue))) {
        vm.model = changesObj.value.currentValue;
      }
    }


    function _checkProps() {
      if(angular.isUndefined(vm.label)) {
        $log.error('guh.components.controller:TextInputCtrl', 'Missing property: label');
        return false;
      }

      if(angular.isUndefined(vm.name)) {
        $log.error('guh.components.controller:TextInputCtrl', 'Missing property: name');
        return false;
      }

      if(angular.isUndefined(vm.required)) {
        vm.required = false;
      }

      if(angular.isUndefined(vm.type)) {
        $log.error('guh.components.controller:TextInputCtrl', 'Missing property: type');
        return false;
      }

      if(angular.isUndefined(vm.value)) {
        vm.model = '';
        setValue(vm.model, true);
      } else {
        vm.model = vm.value;
      }

      return true;
    }

    function _getValidationData(type) {
      var validationData = {
        pattern: undefined,
        errorText: undefined
      };

      switch(type) {
        case app.basicTypes.int:
          validationData.pattern = /^-?\d+$/;
          validationData.errorText = 'This is not a valid integral number.';
          break;
        case app.basicTypes.unsignedInt:
          validationData.pattern = /^\d+$/;
          validationData.errorText = 'This is not a valid positive integral number.';
          break;
        case app.basicTypes.double:
          validationData.pattern = /^-?\d+(?:[\.\,]\d+|)$/;
          validationData.errorText = 'This is not a valid decimal number.';
          break;
        case app.inputTypes.ipV4Address:
          validationData.pattern = /^(25[0-5]|2[0-4]\d|[0-1]?\d?\d)(\.(25[0-5]|2[0-4]\d|[0-1]?\d?\d)){3}$/;
          validationData.errorText = 'This is not a valid IPv4 address.';
          break;
        case app.inputTypes.ipV6Address:
          validationData.pattern = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/i;
          validationData.errorText = 'This is not a valid IPv6 address.';
          break;
        case app.inputTypes.macAddress:
          validationData.pattern = /^([A-Fa-f0-9]{2}[:-]){5}([A-Fa-f0-9]{2})$/;
          validationData.errorText = 'This is not a valid MAC address.';
          break;
        case app.inputTypes.url:
          validationData.pattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
          validationData.errorText = 'This is not a valid URL.';
          break;
        default:
          validationData.errorText = $filter('capitalize')(vm.label) + ' is not valid.';
      }

      return validationData;
    }


    function setValue(value, initial) {
      debounce({
        value: value,
        initial: angular.isDefined(initial) ? initial : false
      });
    }

  }

}());
