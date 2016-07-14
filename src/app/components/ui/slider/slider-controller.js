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
    .controller('SliderCtrl', SliderCtrl);

  SliderCtrl.$inject = ['app', 'libs', '$log', '$element', '$window', '$timeout'];

  function SliderCtrl(app, libs, $log, $element, $window, $timeout) {
    
    var vm = this;

    var valueBeforeError;
    var activeBar;
    var handle;
    var handleDimensions;
    var range;
    var handlePosition;
    var runnerDimensions;
    var invokeWait = 800;
    var invokeOptions = {
      leading: false,
      trailing: true
    };
    var debounce = libs._.throttle(_setValue, invokeWait, invokeOptions);

    vm.$onInit = $onInit;
    vm.$postLink = $postLink;
    vm.$onChanges = $onChanges;

    vm.dragHandle = dragHandle;
    // vm.stepDown = stepDown;
    // vm.stepUp = stepUp;


    function $onInit() {
      var check = _checkProps();
    }

    function $postLink() {
      // Resize variables
      var resizeTimer;
      var resizeTimeout = 300;
      var w = angular.element($window);

      // Elements
      var runner = angular.element($element[0].querySelector('.Slider__runner'));
      activeBar = angular.element($element[0].querySelector('.Slider__bar.Slider__bar_isActive'));
      handle = angular.element($element[0].querySelector('.Slider__handle'));

      // Element dimensions
      // TODO: Find a better way to get the correct dimensions => wait for template to load and wait until slider is shown (! display: none)
      $timeout(function() {
        runnerDimensions = _getElementDimensions(runner[0]);
        handleDimensions = _getElementDimensions(handle[0]);

        // Values
        range = vm.maxValue - vm.minValue;
        _setHandle(vm.value);
      }, 200);

      // Resize window
      w.bind('resize', function() {
        $timeout.cancel(resizeTimer);

        resizeTimer = $timeout(function() {
          runnerDimensions = _getElementDimensions(runner[0]);
          handleDimensions = _getElementDimensions(handle[0]);
        }, resizeTimeout);
      });
    }

    function $onChanges(changesObj) {
      if(angular.isDefined(changesObj.unit) && !changesObj.unit.isFirstChange()) {
        vm.unit = changesObj.unit.previousValue;
      }

      if(angular.isDefined(changesObj.asyncStatus) && angular.isDefined(changesObj.asyncStatus.currentValue)) {
        if(changesObj.asyncStatus.currentValue.success) {
          valueBeforeError = vm.model;
        } else if(changesObj.asyncStatus.currentValue.failure) {
          if(angular.isDefined(valueBeforeError)) {
            vm.model = valueBeforeError;
            _setHandle(vm.model);
          }
        }
      }

      if(angular.isDefined(changesObj.value) && angular.isDefined(changesObj.value.currentValue)) {
        if(angular.isDefined(handle)) {
          _setHandle(vm.value);
        }
      }
    }


    function _checkProps() {
      if(angular.isUndefined(vm.label)) {
        $log.error('guh.components.controller:SliderCtrl', 'Missing property: label');
        return false;
      }

      if(angular.isUndefined(vm.minValue)) {
        vm.minValue = 0;
      }

      if(angular.isUndefined(vm.maxValue)) {
        vm.maxValue = 100;
      }

      if(angular.isUndefined(vm.name)) {
        $log.error('guh.components.controller:SliderCtrl', 'Missing property: name');
        return false;
      }

      if(angular.isUndefined(vm.required)) {
        vm.required = false;
      }

      if(angular.isUndefined(vm.value)) {
        valueBeforeError = vm.minValue;
        _setValue(vm.minValue, true);
      } else {
        valueBeforeError = vm.value;
        _setValue(vm.value, true);
      }

      return true;
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
        dimensions.left = boundingRectangle.left;

        // Width
        dimensions.innerWidth = element.offsetWidth;
        dimensions.outerWidth = element.offsetWidth + parseFloat(computedStyles.marginLeft) + parseFloat(computedStyles.marginRight);
        dimensions.width = element.offsetWidth - parseFloat(computedStyles.paddingLeft) - parseFloat(computedStyles.paddingRight);
      }

      return dimensions;
    }

    function _rangeToPercent(value, range) {
      return value / range * 100;
    }

    function _pixelToPercent(pixelValue, pixelRange) {
      return pixelValue / pixelRange * 100;
    }

    function _percentToRange(percentValue, percentRange) {
      return percentValue / 100 * percentRange;
    }

    function _getHandlePosition(handle, handleDimensions, $event) {
      var minPosition = 0;        // [%]
      var maxPosition = 100;      // [%]

      if($event !== undefined) {
        handlePosition = _pixelToPercent($event.pageX - runnerDimensions.left, runnerDimensions.innerWidth);
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
      // if(ctrl.step && ctrl.stepSize !== 0) {
      //   var stepSizePercent = _rangeToPercent(ctrl.stepSize);
      //   handlePosition = Math.round(handlePosition / stepSizePercent) * stepSizePercent;
      // }

      return handlePosition;
    }

    function _placeHandle(handle, handlePosition) {
      handle.css({
        left: handlePosition + '%'
      });

      activeBar.css({
        right: 100 - handlePosition + '%'
      });
    }

    function _setHandle(value) {
      handlePosition = _rangeToPercent(value - vm.minValue, range);                          // Left position of maxHandle [%]
      _placeHandle(handle, handlePosition);
    }

    function _setValue(value, initial) {
      vm.onChange({
        value: value,
        initial: angular.isDefined(initial) ? initial : false
      });
    }


    function dragHandle($event) {
      handlePosition = _getHandlePosition(handle, handleDimensions, $event);

      _placeHandle(handle, handlePosition);

      vm.value = Math.round(vm.minValue + _percentToRange(handlePosition, range), 0);

      debounce(vm.value);
    }

    // function stepDown(model) {
    //   var value = model - 5;

    //   if(value < vm.minValue) {
    //     vm.model = vm.minValue;
    //   } else {
    //     vm.model = value;
    //   }

    //   _placeHandle(handle, _rangeToPercent(vm.model, range));
    // }

    // function stepUp(model) {
    //   $log.log('model', model, vm.model);
    //   var value = model + 5;

    //   if(value > vm.maxValue) {
    //     vm.model = vm.maxValue;
    //   } else {
    //     vm.model = value;
    //   }

    //   _placeHandle(handle, _rangeToPercent(vm.model, range));
    // }
  }

}());
