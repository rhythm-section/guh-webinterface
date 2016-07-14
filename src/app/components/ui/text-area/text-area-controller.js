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
    .controller('TextAreaCtrl', TextAreaCtrl);

  TextAreaCtrl.$inject = ['libs', '$log'];

  function TextAreaCtrl(libs, $log) {
    
    var vm = this;

    var invokeWait = 600;
    var invokeOptions = {
      leading: false,
      trailing: true
    };
    var debounce = libs._.throttle(vm.onChange, invokeWait, invokeOptions);

    vm.$onInit = $onInit;

    vm.setValue = setValue;


    function $onInit() {
      var check = _checkProps();
    }


    function _checkProps() {
      if(angular.isUndefined(vm.label)) {
        $log.error('guh.components.controller:TextAreaCtrl', 'Missing property: label');
        return false;
      }

      if(angular.isUndefined(vm.name)) {
        $log.error('guh.components.controller:TextAreaCtrl', 'Missing property: name');
        return false;
      }

      if(angular.isUndefined(vm.required)) {
        vm.required = false;
      }

      if(angular.isUndefined(vm.value)) {
        vm.model = '';
        setValue(vm.model);
      }

      return true;
    }


    function setValue(value, initial) {
      debounce({
        value: value,
        initial: angular.isDefined(initial) ? initial : false
      });
    }

  }

}());
