// /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
//  *                                                                                     *
//  * Copyright (C) 2015 Lukas Mayerhofer <lukas.mayerhofer@guh.guru>                     *
//  *                                                                                     *
//  * Permission is hereby granted, free of charge, to any person obtaining a copy        *
//  * of this software and associated documentation files (the "Software"), to deal       *
//  * in the Software without restriction, including without limitation the rights        *
//  * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell           *
//  * copies of the Software, and to permit persons to whom the Software is               *
//  * furnished to do so, subject to the following conditions:                            *
//  *                                                                                     *
//  * The above copyright notice and this permission notice shall be included in all      *
//  * copies or substantial portions of the Software.                                     *
//  *                                                                                     *
//  * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR          *
//  * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,            *
//  * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE         *
//  * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER              *
//  * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,       *
//  * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE       *
//  * SOFTWARE.                                                                           *
//  *                                                                                     *
//  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
 
// (function() {
//   'use strict';

//   angular
//     .module('guh.ui')
//     .directive('guhColor', guhColor);

//     guhColor.$inject = ['$log'];

//     function guhColor($log) {
//       var directive = {
//         bindToController: {
//           label: '@',
//           state: '='
//         },
//         compile: colorCompile,
//         controller: colorCtrl,
//         controllerAs: 'color',
//         restrict: 'E',
//         scope: {},
//         templateUrl: 'app/shared/ui/color/color.html'
//       };

//       return directive;


//       function colorCtrl() {
        
//         /* jshint validthis: true */
//         var vm = this;


//         /*
//          * Public Variables
//          */

//         vm.error = false;
//         vm.firstColor;
//         vm.colorSaved = false;


//         /*
//          * API
//          */

//         vm.setValue = setValue;
//         vm.resetValue = resetValue;


//         /*
//          * Private methods
//          */

//         function _init() {
//           _setDefaults();

//           // TODO: Make tests out of these
//           _checkParameters();
//         }

//         function _setDefaults() {
//           vm.state = angular.isDefined(vm.state) ? vm.state : '#000000';
//           vm.firstColor = vm.state;
//         }

//         function _checkParameters() {
//           // Only defined parameters and parameters without '?' are inside vm
//           angular.forEach(vm, function(value, key) {
//             if(angular.isDefined(value)) {
//               switch(key) {

//                 case 'state':
//                   if(!angular.isString(vm.state)) {
//                     $log.error('guh.ui.colorCtrl:controller | The value of parameter state has to be a string.');
//                     vm.error = true;
//                   }

//                   break;
//               }
//             }
//           });
//         }


//         /*
//          * Public methods
//          */

//         function resetValue() {
//           vm.state = vm.firstColor;
//           vm.colorSaved = false;
//         }

//         function setValue() {
//           vm.colorSaved = true;
//         }


//         _init();
        
//       }


//       function colorCompile(tElement, tAttrs) {

//         /*
//          * Variables
//          */

//         // Elements
//         // var label = angular.element(tElement[0].getElementsByClassName('label'));
//         // var color = angular.element(tElement[0].getElementsByClassName('color'));
//         // var canvas = color.find('canvas')[0];

//         // Dimensions
//         // var labelDimensions = _getElementDimensions(label[0]);
//         // var colorDimensions = _getElementDimensions(color[0], ':before');
//         // var canvasDimensions;


//         /*
//          * Private methods
//          */

//         // function _init() {
//         //   // 1. Check width of color

//         //   if(angular.isDefined(canvas) && canvas.getContext && canvas.getContext('2d')) {
//         //     var ctx = canvas.getContext('2d');

//         //     // Set right dimensions
//         //     _setCanvasDimensions();
//         //     _setColorDimensions();

//         //     // Draw color wheel
//         //     // _drawColorBar(ctx);
//         //     // ctx.save();
//         //     // _clipColorWheel(ctx);
//         //     // ctx.clip();
//         //     // _drawColorCircle(ctx);
//         //     // ctx.restore();

//         //   } else {
//         //     $log.error('guh.ui.colorCompile:compile | The canvas element can\'t be found or canvas not supported on this browser.');
//         //   }
//         // }

//         // function _getElementDimensions(element, selector) {
//         //   var selector = angular.isDefined(selector) ? selector : null;
//         //   var computedStyles = window.getComputedStyle(element, selector);

//         //   var dimensions = {
//         //     innerWidth: undefined,
//         //     outerWidth: undefined,
//         //     width: undefined
//         //   };

//         //   if(computedStyles) {
//         //     // Height
//         //     dimensions.innerHeight = element.offsetHeight;
//         //     dimensions.outerHeight = element.offsetHeight + parseFloat(computedStyles.marginBottom) + parseFloat(computedStyles.marginTop);
//         //     dimensions.height = element.offsetHeight - parseFloat(computedStyles.paddingBottom) - parseFloat(computedStyles.paddingTop);

//         //     // Width
//         //     dimensions.innerWidth = element.offsetWidth;
//         //     dimensions.outerWidth = element.offsetWidth + parseFloat(computedStyles.marginLeft) + parseFloat(computedStyles.marginRight);
//         //     dimensions.width = element.offsetWidth - parseFloat(computedStyles.paddingLeft) - parseFloat(computedStyles.paddingRight);
//         //   }

//         //   return dimensions;
//         // }

//         // function _degToRad(deg) {
//         //   return (Math.PI / 180) * deg;
//         // }

//         // function _setCanvasDimensions() {
//         //   // Set css height & width
//         //   canvas.style.height = '100%';
//         //   canvas.style.width = '100%';

//         //   // Get height & width dimensions (assigned through css above)
//         //   canvasDimensions = _getElementDimensions(canvas);

//         //   // Set height & width
//         //   canvas.height = canvasDimensions.height;
//         //   canvas.width = canvasDimensions.width;
//         // }

//         // function _setColorDimensions() {
//         //   // Add margin-bottom to properbly size canvas element to baseline grid
//         //   if(canvasDimensions.height % labelDimensions.height !== 0) {
//         //     color[0].style.marginBottom = canvasDimensions.height % labelDimensions.height + 'px';
//         //   }
//         // }

//         // function _clipColorWheel(ctx) {
//         //   var x = Math.floor(canvasDimensions.height / 2);
//         //   var y = Math.floor(canvasDimensions.width / 2);
//         //   var strokeWidth = 10;
//         //   var thickness = 3;
//         //   var radius = Math.floor(canvasDimensions.width / 2);
//         //   var innerRadius = radius - thickness - strokeWidth;

//         //   ctx.moveTo(x, y);
//         //   ctx.arc(x, y, radius - strokeWidth, _degToRad(0), _degToRad(360), false);
//         //   ctx.arc(x, y, innerRadius, _degToRad(0), _degToRad(360), true);
//         // }

//         // function _drawColorCircle(ctx) {
//         //   var sx = canvasDimensions.width / 2;
//         //   var sy = canvasDimensions.height / 2;
//         //   var x = Math.floor(sx);
//         //   var y = Math.floor(sy);

//         //   var pieSize = 1;  // Size of the pie-triangle's smallest side.
//         //   var arcStep = pieSize * 1 / (Math.max(sx, sy));
//         //   var currentAngle =  0;
//         //   var twoPi = (2 * Math.PI);

//         //   while(currentAngle < twoPi) {
//         //     var hue = Math.floor(360 * (currentAngle + Math.PI / 2) / twoPi);
//         //     // hue = hue - 90;

//         //     ctx.fillStyle = "hsl(" + hue + ", 100%, 50%)";
//         //     ctx.beginPath();
//         //     ctx.moveTo(x, y);
//         //     ctx.lineTo(x + sx * Math.cos(currentAngle), y + sy * Math.sin(currentAngle));
//         //     currentAngle += arcStep;
//         //     ctx.lineTo(x + sx * Math.cos(currentAngle + 0.02), y + sy * Math.sin(currentAngle + 0.02));
//         //     // ctx.strokeStyle = "hsl(" + hue + ", 10%, 50%)";
//         //     // ctx.stroke();
//         //     ctx.closePath();
//         //     ctx.fill();
//         //   }
//         // }

//         // function _drawColorBar(ctx) {
//         //   var x = 0;
//         //   var y = 0;

//         //   var inc = 360 / canvasDimensions.width;
//         //   for(var h = 0; h < 360; h += inc) {
//         //     ctx.beginPath();
//         //     ctx.rect(x + Math.round(h/inc), y, 1, canvasDimensions.height);
//         //     ctx.fillStyle = "hsl(" + h + ", 100%, 50%)";  
//         //     ctx.fill();

//         //     // for (var i = 0; i <= canvasDimensions.height; i++) {  
//         //     //   var rgb = hsv_to_rgb(h, 1, 1);
//         //     //   point(imgd, x + Math.round(h/inc), y + i, rgb[0], rgb[1], rgb[2]);    
//         //     // }  
//         //   }  
//         // }


//         // _init();


//         /*
//          * Link
//          */

//         var link = {
//           pre: preLink,
//           post: postLink
//         };

//         return link;


//         function preLink(scope, element, attrs, ctrl) {
//           $log.log('preLink');
//         }

//         function postLink(scope, element, attrs, ctrl) {
//           $log.log('postLink');

//           /*
//            * Variables
//            */

//           // Elements
//           var color = angular.element(element[0].getElementsByClassName('color'))[0];

//           // Dimensions
//           var colorDimensions = _getElementDimensions(color);


//           /*
//            * Private methods
//            */

//           function _init() {

//           }

//           function _getElementDimensions(element, selector) {
//             var selector = angular.isDefined(selector) ? selector : null;
//             var computedStyles = window.getComputedStyle(element, selector);

//             var dimensions = {
//               innerWidth: undefined,
//               outerWidth: undefined,
//               width: undefined
//             };

//             if(computedStyles) {
//               // Height
//               dimensions.innerHeight = element.offsetHeight;
//               dimensions.outerHeight = element.offsetHeight + parseFloat(computedStyles.marginBottom) + parseFloat(computedStyles.marginTop);
//               dimensions.height = element.offsetHeight - parseFloat(computedStyles.paddingBottom) - parseFloat(computedStyles.paddingTop);

//               // Width
//               dimensions.innerWidth = element.offsetWidth;
//               dimensions.outerWidth = element.offsetWidth + parseFloat(computedStyles.marginLeft) + parseFloat(computedStyles.marginRight);
//               dimensions.width = element.offsetWidth - parseFloat(computedStyles.paddingLeft) - parseFloat(computedStyles.paddingRight);
//             }

//             return dimensions;
//           }

//           function _hsvToRgb(h, s, v) {
//               var r, g, b, i, f, p, q, t;
//               if (arguments.length === 1) {
//                   s = h.s, v = h.v, h = h.h;
//               }
//               i = Math.floor(h * 6);
//               f = h * 6 - i;
//               p = v * (1 - s);
//               q = v * (1 - f * s);
//               t = v * (1 - (1 - f) * s);
//               switch (i % 6) {
//                   case 0: r = v, g = t, b = p; break;
//                   case 1: r = q, g = v, b = p; break;
//                   case 2: r = p, g = v, b = t; break;
//                   case 3: r = p, g = q, b = v; break;
//                   case 4: r = t, g = p, b = v; break;
//                   case 5: r = v, g = p, b = q; break;
//               }
//               return {
//                   r: Math.round(r * 255),
//                   g: Math.round(g * 255),
//                   b: Math.round(b * 255)
//               };
//           }

//           function _rgbComponentToHex(c) {
//             var hex = parseInt(c).toString(16);
//             return hex.length === 1 ? '0' + hex : hex;
//           }

//           function _degToRad(deg) {
//             return (Math.PI / 180) * deg;
//           }


//           /*
//            * Events
//            */

//           scope.moveHandle = function($event) {
//             if(!ctrl.colorSaved) {
//               var hueStep = 360 / colorDimensions.width;
//               var hue = Math.round($event.offsetX * hueStep);
//               var saturationStep = 100 / colorDimensions.height;
//               var saturation = Math.round((colorDimensions.height - $event.offsetY) * saturationStep);
//               var rgb = _hsvToRgb(hue / 360, saturation / 100, 0.8);
//               var hex = '#' + _rgbComponentToHex(rgb.r) + _rgbComponentToHex(rgb.g) + _rgbComponentToHex(rgb.b);

//               color.style.backgroundColor = hex;
//               ctrl.state = hex;
//             }
//           }


//           if(!ctrl.error) {
//             _init();
//           }

//         }
//       }
//     }

// }());