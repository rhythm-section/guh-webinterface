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
    .directive('guhColor', guhColor);

    guhColor.$inject = ['$log'];

    function guhColor($log) {

      var directive = {
        bindToController: {
          changeCallback: '&onChange',
          label: '@',
          state: '='
        },
        compile: colorCompile,
        controller: colorCtrl,
        controllerAs: 'color',
        restrict: 'E',
        scope: {},
        templateUrl: 'app/shared/ui/color/color.html'
      };

      return directive;


      function colorCtrl($scope) {
        /* jshint validthis: true */

        var vm = this;


        vm.colorSaved = false;


        vm.getElementDimensions = getElementDimensions;
        vm.setValue = setValue;
        vm.resetValue = resetValue;
        vm.closeModal = closeModal;


        function _init() {
          _setDefaults();
          _checkParameters();
        }

        function _setDefaults() {
          vm.state = angular.isDefined(vm.state) ? vm.state : '#ffffff';
          vm.firstColor = vm.state;
        }

        function _checkParameters() {
          // Only defined parameters and parameters without '?' are inside vm
          angular.forEach(vm, function(value, key) {
            if(angular.isDefined(value)) {
              switch(key) {
                case 'label':
                  if(!angular.isString(vm.label)) {
                    $log.error('guh.ui.colorCtrl:controller | The value of parameter label has to be a String.');
                    vm.error = true;
                  }
                  break;

                case 'state':
                  if(!angular.isString(vm.state)) {
                    $log.error('guh.ui.colorCtrl:controller | The value of parameter label has to be a String.');
                    vm.error = true;
                  }
                  break;
              }
            } else {
              vm.error = true;
              $log.error('guh.ui.colorCtrl:controller | Parameter "' + key + '" has to be set.');
            }
          });
        }

        function getElementDimensions(element, selector) {
          selector = angular.isDefined(selector) ? selector : null;
          var computedStyles = window.getComputedStyle(element, selector);

          var dimensions = {
            innerWidth: undefined,
            outerWidth: undefined,
            width: undefined
          };

          if(computedStyles) {
            // Height
            dimensions.innerHeight = element.offsetHeight;
            dimensions.outerHeight = element.offsetHeight + parseFloat(computedStyles.marginBottom) + parseFloat(computedStyles.marginTop);
            dimensions.height = element.offsetHeight - parseFloat(computedStyles.paddingBottom) - parseFloat(computedStyles.paddingTop);

            // Width
            dimensions.innerWidth = element.offsetWidth;
            dimensions.outerWidth = element.offsetWidth + parseFloat(computedStyles.marginLeft) + parseFloat(computedStyles.marginRight);
            dimensions.width = element.offsetWidth - parseFloat(computedStyles.paddingLeft) - parseFloat(computedStyles.paddingRight);
          }

          return dimensions;
        }

        function resetValue() {
          vm.state = vm.firstColor;
          vm.colorSaved = false;
        }

        function setValue() {
          vm.colorSaved = true;
          vm.changeCallback();
          $scope.$parent.closeThisDialog();
        }

        function closeModal() {
          $scope.$parent.closeThisDialog();
        }


        _init();

      }

    }


    function colorCompile(tElement, tAttrs) {

      /*
       * Variables
       */

      // Elements
      var color = angular.element(tElement[0].getElementsByClassName('color'));
      var currentColor = angular.element(tElement[0].getElementsByClassName('current-color'));


      /*
       * Private methods
       */

      function _init() {
        _setColorDimensions();
      }

      function _setColorDimensions() {
        // Add margin-bottom to properbly size canvas element to baseline grid
        if(color.offsetHeight % currentColor.offsetHeight !== 0) {
          color[0].style.marginBottom = color.offsetHeight % currentColor.offsetHeight + 'px';
        }
      }


      _init();


      /*
       * Link
       */

      var link = {
        pre: preLink,
        post: postLink
      };

      return link;


      function preLink(scope, element, attrs, ctrl) {
        console.log('preLink');
      }

      function postLink(scope, element, attrs, ctrl) {
        
        // Elements
        var color = angular.element(element[0].getElementsByClassName('color'))[0];
        var content = angular.element(tElement[0].getElementsByClassName('content'))[0];
        var close = angular.element(tElement[0].getElementsByClassName('close'))[0].getElementsByClassName('icon')[0];

        console.log('close', close);

        // Dimensions
        var colorDimensions = ctrl.getElementDimensions(color);


        /*
         * Private methods
         */
        function _init() {
          color.style.backgroundColor = ctrl.state;
          // content.style.color = 'rgb(' + Math.floor(rgbDark.r)  + ', ' + Math.floor(rgbDark.g) + ', ' + Math.floor(rgbDark.b) + ')';
        }

        function _hsvToRgb(h, s, v) {
            var r, g, b, i, f, p, q, t;
            if (arguments.length === 1) {
                s = h.s;
                v = h.v;
                h = h.h;
            }
            i = Math.floor(h * 6);
            f = h * 6 - i;
            p = v * (1 - s);
            q = v * (1 - f * s);
            t = v * (1 - (1 - f) * s);
            switch (i % 6) {
                case 0:
                  r = v;
                  g = t;
                  b = p;
                  break;
                case 1:
                  r = q;
                  g = v;
                  b = p;
                  break;
                case 2:
                  r = p;
                  g = v;
                  b = t;
                  break;
                case 3:
                  r = p;
                  g = q;
                  b = v;
                  break;
                case 4:
                  r = t;
                  g = p;
                  b = v;
                  break;
                case 5:
                  r = v;
                  g = p;
                  b = q;
                  break;
            }
            return {
                r: Math.round(r * 255),
                g: Math.round(g * 255),
                b: Math.round(b * 255)
            };
        }

        function _rgbComponentToHex(c) {
          var hex = parseInt(c).toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        }


        _init();


        /*
         * Events
         */
        scope.moveHandle = function($event) {
          if(!ctrl.colorSaved) {
            var hueStep = 360 / colorDimensions.width;
            var hue = Math.round($event.offsetX * hueStep);

            var saturationStep = 100 / colorDimensions.height;
            var saturation = Math.round((colorDimensions.height - $event.offsetY) * saturationStep);

            var rgb = _hsvToRgb(hue / 360, saturation / 100, 1);
            var rgbDark = _hsvToRgb(hue / 360, saturation / 100, 0.6);
            var hex = '#' + _rgbComponentToHex(rgb.r) + _rgbComponentToHex(rgb.g) + _rgbComponentToHex(rgb.b);
            var hexDark = '#' + _rgbComponentToHex(rgbDark.r) + _rgbComponentToHex(rgbDark.g) + _rgbComponentToHex(rgbDark.b);

            color.style.backgroundColor = hex;
            content.style.color = 'rgb(' + Math.floor(rgbDark.r)  + ', ' + Math.floor(rgbDark.g) + ', ' + Math.floor(rgbDark.b) + ')';
            close.style.fill = 'rgb(' + Math.floor(rgbDark.r)  + ', ' + Math.floor(rgbDark.g) + ', ' + Math.floor(rgbDark.b) + ')';
            ctrl.state = hex;
          }
        };
      }

    }


}());
