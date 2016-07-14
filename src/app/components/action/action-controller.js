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
    .controller('ActionCtrl', ActionCtrl);

  ActionCtrl.$inject = ['$log', '$timeout', '$element', 'DSState'];

  /**
   * @ngdoc controller
   * @name guh.components.controller:ActionCtrl
   * @description Presentational component for a single action.
   *
   */
  function ActionCtrl($log, $timeout, $element, DSState) {
    
    var vm = this;

    var executionTimer;
    var executionTimerDuration = 1000;
    var executionTimeoutTimer;

    vm.guhParams = [];
    vm.executionStatus = {
      pending: false,
      success: false,
      failure: false
    };

    vm.$onInit = $onInit;
    vm.$onChanges = $onChanges;
    vm.$onDestroy = $onDestroy;

    vm.execute = execute;


    function $onInit() {      
      $element.addClass('Action');
      
      _checkProps();
    }

    function $onChanges(changesObj) {
      if(angular.isDefined(changesObj.correspondingState) && angular.isDefined(changesObj.correspondingState.currentValue)) {
        vm.correspondingState = changesObj.correspondingState.currentValue;
      }
    }

    function $onDestroy() {
      $timeout.cancel(executionTimer);
    }


    function _checkProps() {
      if(angular.isUndefined(vm.actionType)) {
        $log.error('guh.components.controller:ActionCtrl', 'Missing property: actionType');
      }

      if(angular.isUndefined(vm.allowParamChangeExecution)) {
        vm.allowParamChangeExecution = false;
      }
    }


    function execute(params) {
      vm.executionStatus = {
        pending: true,
        success: false,
        failure: false
      };

      if(executionTimer) {
        $timeout.cancel(executionTimer);
        executionTimer = null;
      }

      vm.device.executeAction(vm.actionType, params)
        .then(function() {
          vm.executionStatus = {
            pending: false,
            success: true,
            failure: false
          };

          executionTimer = $timeout(function() {
            vm.executionStatus = {
              pending: false,
              success: false,
              failure: false
            };
            executionTimer = null;
          }, executionTimerDuration);
        })
        .catch(function(error) {
          vm.executionStatus = {
            pending: false,
            success: false,
            failure: true
          };

          executionTimer = $timeout(function() {
            vm.executionStatus = {
              pending: false,
              success: false,
              failure: false
            };
            executionTimer = null;
          }, executionTimerDuration);

          $log.error('guh.components.controller:ActionCtrl', error);
        });
    }

  }

}());
