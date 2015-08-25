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
          label: '@',
          lightness: '=',
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


      function colorCtrl() {
        
        /* jshint validthis: true */
        var vm = this;


        /*
         * Public Variables
         */

        vm.error = false;
        vm.firstColor;
        vm.colorSaved = false;


        /*
         * API
         */

        vm.getElementDimensions = getElementDimensions;
        vm.setValue = setValue;
        vm.resetValue = resetValue;
        vm.convertLightness = convertLightness;


        /*
         * Private methods
         */

        function _init() {
          _setDefaults();

          // TODO: Make tests out of these
          _checkParameters();
        }

        function _setDefaults() {
          vm.lightness = angular.isDefined(vm.lightness) ? vm.lightness : 100;
          vm.state = angular.isDefined(vm.state) ? vm.state : '#000000';
          vm.firstColor = vm.state;
        }

        function _checkParameters() {
          // Only defined parameters and parameters without '?' are inside vm
          angular.forEach(vm, function(value, key) {
            if(angular.isDefined(value)) {
              switch(key) {
                case 'lightness':
                  if(!angular.isNumber(vm.lightness)) {
                    $log.error('guh.ui.colorCtrl:controller | The value of parameter lightness has to be a number.');
                    vm.error = true;
                  }

                  break;
                case 'state':
                  if(!angular.isString(vm.state)) {
                    $log.error('guh.ui.colorCtrl:controller | The value of parameter state has to be a string.');
                    vm.error = true;
                  }

                  break;
              }
            }
          });
        }


        /*
         * Public methods
         */

        function getElementDimensions(element, selector) {
          var selector = angular.isDefined(selector) ? selector : null;
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
        }

        function convertLightness(lightness) {
          // Input in percent [0% - 100%]
          lightness = Math.round(lightness / 100 * 255);

          switch(lightness) {
            case 255:
              lightness = Math.floor(254 / 255 * 100);
              break;
            case 0:
              lightness = Math.ceil(1 / 255 * 100);
              break;
            default:
              lightness = Math.round(lightness / 255 * 100);
          }

          // Output [0 - 1]
          return lightness / 100;
        }


        _init();
        
      }


      function colorCompile(tElement, tAttrs) {

        /*
         * Variables
         */

        // Elements
        var label = angular.element(tElement[0].getElementsByClassName('label'));
        var color = angular.element(tElement[0].getElementsByClassName('color'));


        /*
         * Private methods
         */

        function _init() {
          _setColorDimensions();
        }

        function _setColorDimensions() {
          // Add margin-bottom to properbly size canvas element to baseline grid
          if(color.offsetHeight % label.offsetHeight !== 0) {
            color[0].style.marginBottom = color.offsetHeight % label.offsetHeight + 'px';
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
          $log.log('preLink');
        }

        function postLink(scope, element, attrs, ctrl) {
          $log.log('postLink');

          /*
           * Variables
           */

          // Elements
          var color = angular.element(element[0].getElementsByClassName('color'))[0];

          // Dimensions
          var colorDimensions = ctrl.getElementDimensions(color);


          /*
           * Private methods
           */

          function _init() {

          }

          function _hsvToRgb(h, s, v) {
              var r, g, b, i, f, p, q, t;
              if (arguments.length === 1) {
                  s = h.s, v = h.v, h = h.h;
              }
              i = Math.floor(h * 6);
              f = h * 6 - i;
              p = v * (1 - s);
              q = v * (1 - f * s);
              t = v * (1 - (1 - f) * s);
              switch (i % 6) {
                  case 0: r = v, g = t, b = p; break;
                  case 1: r = q, g = v, b = p; break;
                  case 2: r = p, g = v, b = t; break;
                  case 3: r = p, g = q, b = v; break;
                  case 4: r = t, g = p, b = v; break;
                  case 5: r = v, g = p, b = q; break;
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

          function _degToRad(deg) {
            return (Math.PI / 180) * deg;
          }


          /*
           * Events
           */

          // scope.$watch('ctrl.lightness', function(oldValue, newValue) {
          //   // ctrl.lightness = ctrl.convertLightness(newValue);
          //   $log.log('ctrl.lightness', oldValue, newValue, ctrl.convertLightness(newValue));
          // });

          scope.moveHandle = function($event) {
            if(!ctrl.colorSaved) {
              var hueStep = 360 / colorDimensions.width;
              var hue = Math.round($event.offsetX * hueStep);
              var saturationStep = 100 / colorDimensions.height;
              var saturation = Math.round((colorDimensions.height - $event.offsetY) * saturationStep);
              var lightness = ctrl.convertLightness(ctrl.lightness);
              var rgb = _hsvToRgb(hue / 360, saturation / 100, lightness);
              var hex = '#' + _rgbComponentToHex(rgb.r) + _rgbComponentToHex(rgb.g) + _rgbComponentToHex(rgb.b);

              color.style.backgroundColor = hex;
              ctrl.state = hex;
            }
          }


          if(!ctrl.error) {
            _init();
          }

        }
      }
    }

}());