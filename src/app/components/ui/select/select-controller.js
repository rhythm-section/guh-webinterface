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
    .controller('SelectCtrl', SelectCtrl);

  SelectCtrl.$inject = ['$log'];

  function SelectCtrl($log) {
    
    var vm = this;

    var valueBeforeError;

    vm.$onInit = $onInit;
    vm.$onChanges = $onChanges;

    vm.setValue = setValue;


    function $onInit() {
      var check = _checkProps();
    }

    function $onChanges(changesObj) {
      if(angular.isDefined(changesObj.asyncStatus) && angular.isDefined(changesObj.asyncStatus.currentValue)) {
        if(changesObj.asyncStatus.currentValue.success) {
          valueBeforeError = vm.value;
        } else if(changesObj.asyncStatus.currentValue.failure) {
          if(valueBeforeError) {
            vm.value = valueBeforeError;
          }
        }
      }

      if(angular.isDefined(changesObj.value) && angular.isDefined(changesObj.value.currentValue)) {
        vm.value = changesObj.value.currentValue;
        vm.setValue(vm.value, true);
      }
    }


    function _checkProps() {
      if(angular.isUndefined(vm.label)) {
        $log.error('guh.components.controller:SelectCtrl', 'Missing property: label');
        return false;
      }

      if(angular.isUndefined(vm.name)) {
        $log.error('guh.components.controller:SelectCtrl', 'Missing property: name');
        return false;
      }

      if(angular.isUndefined(vm.options)) {
        $log.error('guh.components.controller:SelectCtrl', 'Missing property: options');
        return false;
      }

      if(angular.isUndefined(vm.required)) {
        vm.required = false;
      }
      
      if(angular.isUndefined(vm.value)) {
        valueBeforeError = vm.options[0];
        setValue(vm.value, true);
      } else {
        vm.value = valueBeforeError = vm.value;
        setValue(vm.value, true);
      }

      return true;
    }


    function setValue(value, initial) {
      vm.onChange({
        value: value,
        initial: initial
      });
    }

  }

}());
