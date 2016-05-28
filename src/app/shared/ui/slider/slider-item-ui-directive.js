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
    .directive('guhSliderItem', guhSliderItem);

    guhSliderItem.$inject = [];

    function guhSliderItem() {
      var directive = {
        bindToController: {
          index: '='
        },
        controller: sliderItemCtrl,
        controllerAs: 'sliderItem',
        link: sliderItemLink,
        require: '^^guhSlider',
        restrict: 'E',
        scope: {},
        templateUrl: 'app/shared/ui/slider/slider-item.html',
        transclude: true
      };

      return directive;


      function sliderItemCtrl() {

        /* jshint validthis: true */
        // var vm = this;

      }


      function sliderItemLink(scope, element, attrs, sliderCtrl) {
        element.addClass('slider__item');

        // Add slide to contentSlider
        scope.sliderItem.index = sliderCtrl.addSliderItem({
          scope: scope,
          element: element,
          attrs: attrs
        });

        // Slide to first element
        if(scope.sliderItem.index === 0) {
          sliderCtrl.slideTo(scope.sliderItem.index);
        }

        sliderCtrl.setWidth();

        element.bind('click', function() {
          sliderCtrl.slideTo(scope.sliderItem.index);
        });
      }
    }

}());