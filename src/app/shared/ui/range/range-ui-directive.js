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
    .directive('guhRange', guhRange);

    guhRange.$inject = ['$log', '$window', '$timeout', 'libs'];

    function guhRange($log, $window, $timeout, libs) {
      var id = 0;
      var directive = {
        bindToController: {
          disabled: '=?',
          label: '@',
          min: '=?',
          max: '=?',
          changeCallback: '&onChange',
          required: '=?',
          stateMin: '=?',
          stateMax: '=',
          stepSize: '=?',
          step: '=?',
          unit: '@'
        },
        controller: rangeCtrl,
        controllerAs: 'range',
        link: rangeLink,
        restrict: 'E',
        scope: {},
        templateUrl: 'app/shared/ui/range/range.html'
      };

      return directive;


      function rangeCtrl($scope, $attrs) {

        /* jshint validthis: true */
        var vm = this;


        /*
         * Private variables
         */


        /*
         * Public variables
         */

        vm.error = false;


        /*
         * Private methods
         */

        function _init() {
          _setDefaults();

          // TODO: Make tests out of these
          _checkParameters();
        }

        function _checkParameters() {
          // Only defined parameters and parameters without '?' are inside vm
          angular.forEach(vm, function(value, key) {
            if(angular.isDefined(value)) {
              switch(key) {
                case 'min':
                  if(!angular.isNumber(vm.min)) {
                    $log.error('guh.ui.rangeCtrl:controller | The value of parameter min has to be a number.');
                    vm.error = true;
                  }

                  break;

                case 'max':
                  if(!angular.isNumber(vm.max)) {
                    $log.error('guh.ui.rangeCtrl:controller | The value of parameter max has to be a number.');
                    vm.error = true;
                  }

                  break;

                case 'stateMin':
                  if(!angular.isNumber(vm.stateMin)) {
                    $log.error('guh.ui.rangeCtrl:controller | The value of parameter stateMin has to be a number.');
                    vm.error = true;
                  }

                  if(vm.stateMin < vm.min || vm.stateMin > vm.max) {
                    $log.error('guh.ui.rangeCtrl:controller | The value of parameter stateMin has to be between min=' + vm.min + ' and max=' + vm.max + '.');
                    vm.error = true;
                  }

                  if(vm.stateMin > vm.stateMax) {
                    $log.error('guh.ui.rangeCtrl:controller | The value of parameter stateMin has to be lower than or equal to stateMax=' + vm.stateMax + '.');
                    vm.error = true;
                  }

                  break;

                case 'stateMax':
                  if(!angular.isNumber(vm.stateMax)) {
                    $log.error('guh.ui.rangeCtrl:controller | The value of parameter stateMax has to be a number.');
                    vm.error = true;
                  }

                  if(vm.stateMax < vm.min || vm.stateMin > vm.max) {
                    $log.error('guh.ui.rangeCtrl:controller | The value of parameter stateMax has to be between min=' + vm.min + ' and max=' + vm.max + '.');
                    vm.error = true;
                  }

                  if(vm.stateMax < vm.stateMin) {
                    $log.error('guh.ui.rangeCtrl:controller | The value of parameter stateMax has to be greater than or equal to stateMin=' + vm.stateMax + '.');
                    vm.error = true;
                  }

                  break;

                case 'stepSize':
                  if(!angular.isNumber(vm.stepSize)) {
                    $log.error('guh.ui.rangeCtrl:controller | The value of parameter stepSize has to be a number.');
                    vm.error = true;
                  }

                  if(vm.stepSize !== 0) {
                    if((vm.max - vm.min) % vm.stepSize !== 0) {
                      $log.error('guh.ui.rangeCtrl:controller | The value of parameter stepSize has to be a multiple of range (max-min=' + (vm.max - vm.min) + ').');
                      vm.error = true;
                    }
                  }

                  break;
              }
            } else {
              vm.error = true;
              $log.error('guh.ui.rangeCtrl:controller | Parameter "' + key + '" has to be set.');
            }
          });
        }

        function _setDefaults() {
          vm.min = angular.isDefined(vm.min) ? vm.min : 0;
          vm.max = angular.isDefined(vm.max) ? vm.max : 100;
          vm.type = angular.isDefined(vm.stateMin) ? 'double' : 'single';
          vm.stateMin = angular.isDefined(vm.stateMin) ? vm.stateMin : vm.min;
          vm.stateMax = angular.isDefined(vm.stateMax) ? vm.stateMax : vm.max;
          vm.step = angular.isDefined(vm.step) ? vm.step : true;
          vm.stepSize = angular.isDefined(vm.stepSize) ? vm.stepSize : 1;
          vm.unit = (angular.isDefined(vm.unit) && vm.unit !== '') ? vm.unit : 'test';
        }


        _init();

      }


      function rangeLink(scope, element, attrs, ctrl) {

        /*
         * Private variables
         */

        // jQLite
        // var runner = angular.element(element[0].querySelector('.runner'));
        var runner = angular.element(element[0].getElementsByClassName('runner'));
        var bar = angular.element(element[0].getElementsByClassName('bar'));
        var barActive = angular.element(element[0].getElementsByClassName('bar-active'));
        var minHandle = angular.element(element[0].querySelector('.handle.min'));
        var maxHandle = angular.element(element[0].querySelector('.handle.max'));

        // Dimensions
        var runnerDimensions = _getElementDimensions(runner[0]);
        var handleDimensions = _getElementDimensions(maxHandle[0]);

        // Values
        var range = ctrl.max - ctrl.min;
        var minHandlePosition = _rangeToPercent(ctrl.stateMin - ctrl.min);                          // Left position of minHandle [%]
        var maxHandlePosition = _rangeToPercent(ctrl.stateMax - ctrl.min);                          // Left position of maxHandle [%]

        // Helper
        var resizeTimer;
        var timerValue = 300;
        var w = angular.element($window);


        /*
         * Private methods
         */

        function _init() {
          // Position handles 
          if(angular.isDefined(attrs.stateMin)) {
            _placeHandle(minHandle, minHandlePosition);
          } else {
            _placeHandle(minHandle, 0);
          }
          _placeHandle(maxHandle, maxHandlePosition);
        }

        function _getElementDimensions(element) {
          var computedStyles = window.getComputedStyle(element);
          var boundingRectangle = element.getBoundingClientRect();

          var dimensions = {
            left: undefined,
            innerWidth: undefined,
            outerWidth: undefined,
            width: undefined
          };

          if(computedStyles) {
            // Position
            // dimensions.left = element.offsetLeft;
            dimensions.left = boundingRectangle.left;

            // Width
            dimensions.innerWidth = element.offsetWidth;
            dimensions.outerWidth = element.offsetWidth + parseFloat(computedStyles.marginLeft) + parseFloat(computedStyles.marginRight);
            dimensions.width = element.offsetWidth - parseFloat(computedStyles.paddingLeft) - parseFloat(computedStyles.paddingRight);
          }

          return dimensions;
        }

        function _rangeToPercent(rangeValue) {
          return rangeValue / range * 100;
        }

        function _pixelToPercent(pixelValue) {
          return pixelValue / runnerDimensions.innerWidth * 100;
        }

        function _percentToRange(percentValue) {
          return percentValue / 100 * range;
        }

        function _placeHandle(handle, left) {
          handle.css({
            left: left + '%'
          });

          if(handle.hasClass('min')) {
            barActive.css({
              left: minHandlePosition + '%'
            });
          } else if(handle.hasClass('max')) {
            barActive.css({
              right: 100 - maxHandlePosition + '%'
            });
          }
        }

        function _getHandlePosition(handle, handleDimensions, $event) {
          var minPosition = 0;
          var maxPosition = 100;
          var handlePosition;

          if($event !== undefined) {
            // handlePosition = _pixelToPercent($event.pageX - runnerDimensions.left - handleDimensions.innerWidth * 3 / 2);
            handlePosition = _pixelToPercent($event.pageX - runnerDimensions.left);
          }

          // Lower/greater then minHandle/maxHandle
          if(handle.hasClass('max')) {
            if(handlePosition <= minHandlePosition) {
              handlePosition = minHandlePosition;
            }
          } else if(handle.hasClass('min')) {
            if(handlePosition >= maxHandlePosition) {
              handlePosition = maxHandlePosition;
            }
          }

          // Lower than min
          if(handlePosition <= minPosition) {
            handlePosition = minPosition;
          }

          // Greater than max
          if(handlePosition >= maxPosition) {
            handlePosition = maxPosition;
          }

          // Raster
          if(ctrl.step && ctrl.stepSize !== 0) {
            var stepSizePercent = _rangeToPercent(ctrl.stepSize);
            handlePosition = Math.round(handlePosition / stepSizePercent) * stepSizePercent;
          }

          return handlePosition;
        }


        /*
         * Events
         */

        // Drag minHandle
        scope.dragMinHandle = function($event) {
          minHandlePosition = _getHandlePosition(minHandle, handleDimensions, $event);
          _placeHandle(minHandle, minHandlePosition);

          scope.$apply(function() {
            var currentState = Math.round(ctrl.min + _percentToRange(minHandlePosition), 0);

            // Assign value only if stepSize (default: every 1 step)
            if(currentState === ctrl.min || (currentState - ctrl.min) % ctrl.stepSize === 0) {
              scope.range.stateMin = currentState;
            }

            ctrl.changeCallback();
          });
        }

        // Drag maxHandle
        scope.dragMaxHandle = function($event) {
          maxHandlePosition = _getHandlePosition(maxHandle, handleDimensions, $event);
          _placeHandle(maxHandle, maxHandlePosition);

          scope.$apply(function() {
            var currentState = Math.round(ctrl.min + _percentToRange(maxHandlePosition), 0);

            // Assign value only if stepSize (default: every 1 step)
            if(currentState === ctrl.max || (currentState - ctrl.min) % ctrl.stepSize === 0) {
              scope.range.stateMax = currentState;
            }

            ctrl.changeCallback();
          });
        }

        // Resize window
        w.bind('resize', function() {
          $timeout.cancel(resizeTimer);

          resizeTimer = $timeout(function() {
            runnerDimensions = _getElementDimensions(runner[0]);
            handleDimensions = _getElementDimensions(maxHandle[0]);
          }, timerValue);
        });


        if(!ctrl.error) {
          _init(); 
        }

      }
    }

}());