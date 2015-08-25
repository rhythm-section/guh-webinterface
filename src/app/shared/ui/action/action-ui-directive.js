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

    guhAction.$inject = ['$log', 'DSDevice', 'DSActionType', 'DSState'];

    function guhAction($log, DSDevice, DSActionType, DSState) {
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
          vm.state = _getState(vm.actionTypeId);
        }

        function _getActionType(actionTypeId) {
          return DSActionType.get(actionTypeId);
        }

        function _getState(actionTypeId) {
          var state = DSState.get(actionTypeId);

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

          $log.log('EXECUTE ACTION', vm.actionType, params);

          device.executeAction(vm.actionType, params)
            .then(function(response) {
              $log.log('Action executed', response);
            })
            .catch(function(error) {
              $log.error('guh.ui.guhAction:directive', error);
            });
        }

        function addParam(params) {
          $log.log('params', params);
        }

        _init();
        
      }


      function actionLink(scope, element, attrs) {}
    }

}());