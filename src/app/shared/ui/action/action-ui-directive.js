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
    .directive('guhAction', guhAction);

    guhAction.$inject = ['$log', '$timeout', 'DSDevice', 'DSActionType', 'DSState'];

    function guhAction($log, $timeout, DSDevice, DSActionType, DSState) {
      var directive = {
        bindToController: {
          actionTypeId: '@',
          deviceId: '@'
        },
        controller: actionCtrl,
        controllerAs: 'action',
        link: actionLink,
        restrict: 'E',
        scope: {},
        templateUrl: 'app/shared/ui/action/action.html'
      };

      return directive;


      function actionCtrl() {
        /* jshint validthis: true */
        var vm = this;
        var asyncTimeout = null;

        vm.getState = getState;
        vm.execute = execute;
        vm.addParam = addParam;

        /*
         * Variables
         */

        vm.state = {};


        /*
         * Private methods
         */

        function _init() {
          vm.actionType = _getActionType(vm.actionTypeId);
          vm.state = getState(vm.deviceId, vm.actionTypeId);
          vm.async = {
            pending: false,
            success: false,
            failure: false
          };
        }

        function _getActionType(actionTypeId) {
          return DSActionType.get(actionTypeId);
        }

        function getState(deviceId, actionTypeId) {
          var state = DSState.get('' + deviceId + '_' + actionTypeId);

          /*
           * Order for initial state value:
           * 1. State of action
           * 2. DefaultValue of first and only paramType
           * 3. No initial value = null
           */
          if(!state) {
            if(vm.actionType.paramTypes.length === 1 && vm.actionType.paramTypes[0] !== undefined) {
              state = vm.actionType.paramTypes[0];
            } else {
              state = null;
            }
          }

          return state;
        }


        /*
         * Public methods
         */

        function execute(params) {
          var device = DSDevice.get(vm.deviceId);
          vm.async = {
            pending: true,
            success: false,
            failure: false
          };

          if(asyncTimeout) {
            $timeout.cancel(asyncTimeout);
          }

          device.executeAction(vm.actionType, params)
            .then(function(response) {
              vm.async.pending = false;
              vm.async.success = true;
              vm.async.failure = false;

              asyncTimeout = $timeout(function() {
                vm.async.success = false;
                asyncTimeout = null;
              }, 800);
            })
            .catch(function(error) {
              vm.actionType = _getActionType(vm.actionTypeId);
              if(angular.isDefined(vm.state) && angular.isObject(vm.state) && angular.isDefined(vm.state.value)) {
                vm.state.value = 0;
              }
              // vm.state = getState(vm.deviceId, vm.actionTypeId);

              vm.async.pending = false;
              vm.async.success = false;
              vm.async.failure = true;

              asyncTimeout = $timeout(function() {
                vm.async.failure = false;
                asyncTimeout = null;
              }, 800);

              $log.error('guh.ui.guhAction:directive', error, vm);
            });
        }

        function addParam(params) {
          $log.log('params', params);
        }

        _init();
        
      }


      function actionLink(scope, element, attrs, ctrl) {
        /* jshint unused: false */

        // Watch state
        DSState.on('DS.change', function(DSState, state) {
          if(state.compoundId === '' + ctrl.deviceId + '_' + ctrl.actionTypeId) {
            scope.$apply(function() {
              ctrl.state.value = state.value;
            });
          }
        });
      }
    }

}());