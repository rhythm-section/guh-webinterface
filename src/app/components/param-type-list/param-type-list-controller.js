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
    .controller('ParamTypeListCtrl', ParamTypeListCtrl);

  ParamTypeListCtrl.$inject = ['app', 'libs', '$log', '$element'];

  /**
   * @ngdoc controller
   * @name guh.components.controller:ParamTypeListCtrl
   * @description Presentational component for a single param.
   *
   */
  function ParamTypeListCtrl(app, libs, $log, $element) {
    
    var vm = this;

    vm.isDisabled = false;
    vm.params = {};

    vm.$onInit = $onInit;
    vm.$onChanges = $onChanges;

    vm.disableSubmit = disableSubmit;
    vm.updateParam = updateParam;
    vm.submitParams = submitParams;


    function $onInit() {
      $element.addClass('ParamTypeList');

      var check = _checkProps();

      if(check) {
        angular.forEach(vm.paramTypes, function(paramType) {
          vm.params[paramType.id] = {
            paramTypeId: paramType.id,
            value: _getDefaultValue(paramType)
          };
        });
      }
    }

    function $onChanges(changesObj) {
      if(angular.isDefined(changesObj.paramTypes) && angular.isDefined(changesObj.paramTypes.currentValue)) {
        vm.params = {};

        angular.forEach(changesObj.paramTypes.currentValue, function(paramType) {
          vm.params[paramType.id] = {
            paramTypeId: paramType.id,
            value: _getDefaultValue(paramType)
          };
        });
      }
    }


    function _checkProps() {
      if(angular.isUndefined(vm.label)) {
        $log.error('guh.components.controller:ParamTypeCtrl', 'Missing property: label');
        return false;
      }

      return true;
    }

    function _getDefaultValue(paramType) {
      var defaultValue;
      var type = paramType.type;
      
      switch(type) {
        case app.basicTypes.int:
          defaultValue = paramType.defaultValue ? paramType.defaultValue : 0;
          break;
        default:
          defaultValue = '';
      }

      return defaultValue;
    }


    function disableSubmit(paramComponent) {
      vm.isDisabled = true;
    }

    function updateParam(id, value) {
      if(vm.params.hasOwnProperty(id)) {
        vm.params[id] = {
          paramTypeId: id,
          value: value
        };
      }
    }

    function submitParams(isValid, params) {
      if(isValid) {
        vm.onSubmit({
          params: libs._.values(params)
        });
      }
    }

  }

}());
