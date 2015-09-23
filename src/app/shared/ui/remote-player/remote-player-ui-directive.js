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
    .directive('guhRemotePlayer', guhRemotePlayer);

    guhRemotePlayer.$inject = ['$log', 'DSDevice', 'DSActionType'];

    function guhRemotePlayer($log, DSDevice, DSActionType) {

      var directive = {
        bindToController: {
          action: '=',
          deviceId: '@'
        },
        controller: remotePlayerCtrl,
        controllerAs: 'remotePlayer',
        restrict: 'E',
        scope: {},
        templateUrl: 'app/shared/ui/remote-player/remote-player.html'
      };

      return directive;


      function remotePlayerCtrl() {

        /* jshint validthis: true */
        var vm = this;
        var device = {};
        var buttonParamType = {};

        /*
         * Public variables
         */
        vm.error = false;
        vm.actionTypes = [];

        /*
         * Public methods
         */
        vm.pressButton = pressButton;


        function _init() {
          $log.log('vm', vm);
          _checkParameters();

          if(!vm.error) {
            _setDevice();
            _setButtonParamType();
          }
        }

        function _checkParameters() {
          // Only defined parameters and parameters without '?' are inside vm
          angular.forEach(vm, function(value, key) {
            if(angular.isDefined(value)) {
              switch(key) {
                case 'action':
                  if(!angular.isObject(vm.action)) {
                    $log.error('guh.ui.remoteButtonGroupCtrl:controller | The value of parameter action has to be an object.');
                    vm.error = true;

                    if(angular.isUndefined(vm.action.actionType) || !DSActionType.is(vm.action.actionType)) {
                      $log.error('guh.ui.remoteButtonGroupCtrl:controller | The parameter action has to include an actionType.');
                      vm.error = true;
                    }
                  }
                  break;

                case 'deviceId':
                  if(!angular.isString(vm.deviceId)) {
                    $log.error('guh.ui.remoteButtonGroupCtrl:controller | The value of parameter deviceId has to be a string.');
                    vm.error = true;
                  }
                  break;
              }
            } else {
              vm.error = true;
              $log.error('guh.ui.remoteButtonGroupCtrl:controller | Parameter "' + key + '" has to be set.');
            }
          });
        }

        function _setDevice() {
          device = DSDevice.get(vm.deviceId);
        }

        function _setButtonParamType() {
          // Set buttonParamType
          angular.forEach(vm.action.actionType.paramTypes, function(paramType) {
            if(paramType.name === 'button') {
              buttonParamType = angular.copy(paramType);
            }
          });
        }

        function pressButton(button) {
          var params = [];

          // Set params
          if(angular.isArray(buttonParamType.allowedValues)) {
            angular.forEach(buttonParamType.allowedValues, function(allowedValue) {
              if(allowedValue === button) {
                params.push({
                  name: buttonParamType.name,
                  value: allowedValue
                });
              }
            });
          }

          $log.log('params', params);

          // Execute action
          if(angular.isDefined(device) && DSDevice.is(device)) {
            device.executeAction(vm.action.actionType, params)
              .then(function(response) {
                $log.log('Action executed', response);
              })
              .catch(function(error) {
                $log.log('error', error);
              });
          }
        }

        _init();

      }

    }

}());
