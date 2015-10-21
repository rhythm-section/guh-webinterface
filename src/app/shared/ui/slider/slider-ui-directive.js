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
    .directive('guhSlider', guhSlider);

    guhSlider.$inject = ['$log', '$window', 'hotkeys'];

    function guhSlider($log, $window, hotkeys) {

      var directive = {
        bindToController: {
          changeCallback: '&onChange'
        },
        controller: sliderCtrl,
        controllerAs: 'slider',
        link: sliderLink,
        restrict: 'E',
        scope: {},
        templateUrl: 'app/shared/ui/slider/slider.html',
        transclude: true
      };

      return directive;


      function sliderCtrl($scope) {

        /* jshint validthis: true */
        var vm = this;

        /*
         * Public variables
         */
        vm.sliderItems = [];
        vm.currentSliderItemIndex = 0;

        /*
         * Public methods
         */
        vm.init = init;
        vm.addSliderItem = addSliderItem;
        vm.slideTo = slideTo;


        function _hasPrev() {
          return vm.currentSliderItemIndex > 0;
        }

        function _hasNext() {
          return vm.currentSliderItemIndex < (vm.sliderItems.length - 1);
        }


        function init() {
          // Bind hotkeys
          hotkeys.bindTo($scope)
            .add({
              combo: 'left',
              description: 'Previous',
              callback: function(event, hotkey) {
                event.preventDefault();

                if(_hasPrev()) {
                  vm.slideTo(vm.currentSliderItemIndex - 1);
                }
              }
            })
            .add({
              combo: 'right',
              description: 'Next',
              callback: function(event, hotkey) {
                event.preventDefault();

                if(_hasNext()) {
                  vm.slideTo(vm.currentSliderItemIndex + 1);
                }
              }
            });

          // vm.slideTo(0);
        }

        function addSliderItem(sliderItem) {
          vm.sliderItems.push(sliderItem);

          return vm.sliderItems.length - 1;
        }

        function slideTo(sliderItemIndex) {
          if(sliderItemIndex >= 0 && sliderItemIndex < vm.sliderItems.length) {
            vm.previousSliderItemIndex = vm.currentSliderItemIndex;
            vm.currentSliderItemIndex = sliderItemIndex;

            // Move current class to new current
            vm.setCurrent();

            // Execute callback function
            vm.changeCallback({
              slideIndex: sliderItemIndex
            });
          }
        }

      }
    

      function sliderLink(scope, element, attrs, sliderCtrl) {
        // Elements
        var contentContainer = angular.element(element[0].getElementsByClassName('slider__content-container'));

        var i = 0;
        var columnCount = 5;
        var dummyColumnCount = Math.floor((columnCount - 1) / 2);


        var minColumnWidth = 300;
        var maxColumnWidth = 600;
        var viewportWidth = $window.innerWidth;
        // var currentSliderItemWidth = Math.floor(viewportWidth / 100 * 38.2);
        // var sliderItemWidth = Math.floor(currentSliderItemWidth / 100 * 38.2);
        var currentSliderItemWidth = Math.floor(viewportWidth / 100 * 46);
        var sliderItemWidth = Math.floor(viewportWidth / 100 * 18);
        // if(sliderItemWidth < minColumnWidth) {
        //   sliderItemWidth = minColumnWidth;
        // } else if(sliderItemWidth > maxColumnWidth) {
        //   sliderItemWidth = maxColumnWidth;
        // }
        // var columnCount = Math.floor(viewportWidth / sliderItemWidth) - 1;
        var containerWidth = 0;
        var offset = 0;


        // Link methods
        sliderCtrl.setWidth = setWidth;
        sliderCtrl.setCurrent = setCurrent;
        

        function _init() {
          element.addClass('slider');

          offset = offset -(sliderItemWidth / 2);
          _setContainerOffset();

          sliderCtrl.init();
        }

        // Add dummy elements for start/end
        for(i; i < dummyColumnCount; i++) {
          var dummySliderItemBefore = angular.element('<div class="slider__item"></div>');
          dummySliderItemBefore.css({
            width: sliderItemWidth + 'px'
          });
          var dummySliderItemAfter = angular.copy(dummySliderItemBefore);

          contentContainer.prepend(dummySliderItemBefore);
          contentContainer.append(dummySliderItemAfter);
        }

        function _setWidth(element, width) {
          element.css({
            width: width + 'px'
          });
        }

        function _setContainerOffset() {
          contentContainer.css({
            '-webkit-transform': 'translateX(' + offset + 'px)',
                '-ms-transform': 'translateX(' + offset + 'px)',
                    'transform': 'translateX(' + offset + 'px)'
          });
        }


        function setWidth() {
          var newSliderItemElement = sliderCtrl.sliderItems[sliderCtrl.sliderItems.length - 1].element;
          containerWidth = (sliderCtrl.sliderItems.length - 1) * sliderItemWidth + currentSliderItemWidth + 4 * sliderItemWidth;

          if(newSliderItemElement.hasClass('slider__item_current')) {
            _setWidth(newSliderItemElement, currentSliderItemWidth);
          } else {
            _setWidth(newSliderItemElement, sliderItemWidth);
          }

          _setWidth(contentContainer, containerWidth);
        }

        function setCurrent() {
          var oldCurrent = angular.element(element[0].getElementsByClassName('slider__item_current'));
          var oldCurrentContent;
          var newCurrent = sliderCtrl.sliderItems[sliderCtrl.currentSliderItemIndex].element;
          var newCurrentContent;

          // Calculate and set container offset
          if(sliderCtrl.currentSliderItemIndex > sliderCtrl.previousSliderItemIndex) {
            // Slide to right
            offset = offset - (sliderCtrl.currentSliderItemIndex - sliderCtrl.previousSliderItemIndex) * sliderItemWidth;
          } else {
            // Slide to left
            offset = offset + (sliderCtrl.previousSliderItemIndex - sliderCtrl.currentSliderItemIndex) * sliderItemWidth;
          }
          _setContainerOffset();
          
          // Set previous current width and classes
          oldCurrent.removeClass('slider__item_current');
          if(oldCurrent.length > 0) {
            _setWidth(oldCurrent, sliderItemWidth);
            oldCurrentContent = angular.element(oldCurrent[0].getElementsByClassName('content'));
            oldCurrentContent.addClass('content_content-center');
          }

          // Set new current width and classes
          newCurrent.addClass('slider__item_current');
          if(newCurrent.length > 0) {
            _setWidth(newCurrent, currentSliderItemWidth);
            newCurrentContent = angular.element(newCurrent[0].getElementsByClassName('content'));
            newCurrentContent.removeClass('content_content-center');
          }
        }


        angular.element($window).on('resize', function() {
          var sliderItems = element[0].getElementsByClassName('slider__item');

          viewportWidth = $window.innerWidth;
          currentSliderItemWidth = viewportWidth / 100 * 46;
          sliderItemWidth = viewportWidth / 100 * 18;
          containerWidth = (sliderCtrl.sliderItems.length - 1) * sliderItemWidth + currentSliderItemWidth + 4 * sliderItemWidth;

          angular.forEach(sliderItems, function(sliderItem) {
            sliderItem = angular.element(sliderItem);

            if(sliderItem.hasClass('slider__item_current')) {
              _setWidth(sliderItem, Math.floor(currentSliderItemWidth));
            } else {
              _setWidth(sliderItem, Math.floor(sliderItemWidth));
            }
          });
          _setWidth(contentContainer, Math.floor(containerWidth));

          if(sliderCtrl.currentSliderItemIndex === 0) {
            offset = -(sliderItemWidth / 2);
          } else {
            offset = -(sliderItemWidth / 2) - (sliderCtrl.currentSliderItemIndex * sliderItemWidth);
          }
          _setContainerOffset();
        });


        _init();

      }
    }
}());
