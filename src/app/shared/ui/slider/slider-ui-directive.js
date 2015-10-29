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


    guhSlider.$inject = ['$log', '$window', '$animate', '$timeout', 'hotkeys'];

    function guhSlider($log, $window, $animate, $timeout, hotkeys) {

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
        vm.currentSliderItemIndex = -1;

        /*
         * Public methods
         */
        vm.init = init;
        vm.addSliderItem = addSliderItem;
        vm.slideTo = slideTo;
        vm.executeCallback = executeCallback;


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
        }

        function addSliderItem(sliderItem) {
          vm.sliderItems.push(sliderItem);

          // if(vm.sliderItems.length === 1) {
          //   vm.slideTo(0);
          // }

          return vm.sliderItems.length - 1;
        }

        function slideTo(sliderItemIndex) {
          if(sliderItemIndex >= 0 && sliderItemIndex < vm.sliderItems.length && sliderItemIndex !== vm.currentSliderItemIndex) {
            vm.previousSliderItemIndex = vm.currentSliderItemIndex === -1 ? 0 : vm.currentSliderItemIndex;
            vm.currentSliderItemIndex = sliderItemIndex;

            // Execute callback function
            vm.changeCallback({
              slideIndex: -1
            });

            // Move current class to new current
            $log.log('before vm.setCurrent', vm.currentSliderItemIndex);
            vm.setCurrent();
          }
        }

        function executeCallback() {
          // Execute callback function
          vm.changeCallback({
            slideIndex: vm.currentSliderItemIndex
          });
        }

      }
    

      function sliderLink(scope, element, attrs, sliderCtrl) {
        // Elements
        var contentContainer = angular.element(element[0].getElementsByClassName('slider__content-container'));
        var sliderItems = element[0].getElementsByClassName('slider__item');

        var i = 0;
        var columnCount = 5;
        var dummyColumnCount = Math.floor((columnCount - 1) / 2);

        var minColumnWidth = 300;
        var maxColumnWidth = 600;
        var viewportWidth = $window.innerWidth;
        var currentSliderItemWidth = Math.floor(viewportWidth / 100 * 46);
        var sliderItemWidth = Math.floor(viewportWidth / 100 * 18);
        var slideTimer;

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
          var dummySliderItemBefore = angular.element('<div class="slider__item slider__item_dummy"></div>');
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
          if(sliderCtrl.currentSliderItemIndex !== -1) {
            var oldCurrent = angular.element(element[0].getElementsByClassName('slider__item_current'));
            var oldCurrentContent;
            var newCurrent = sliderCtrl.sliderItems[sliderCtrl.currentSliderItemIndex].element;
            var newCurrentContent;
            var halfSliderItemWidth = Math.floor(sliderItemWidth / 2);


            // Cancel timer to set new widths and positions
            $timeout.cancel(slideTimer);

            // Before slide
            if(oldCurrent.length > 0) {
              oldCurrent.removeClass('slider__item_details');
              oldCurrent.removeClass('slider__item_current');
              _setWidth(oldCurrent, sliderItemWidth);
              oldCurrentContent = angular.element(oldCurrent[0].getElementsByClassName('content'));
            }

            // Slide
            if(sliderCtrl.currentSliderItemIndex > sliderCtrl.previousSliderItemIndex) {
              // Slide to right
              offset = offset - (sliderCtrl.currentSliderItemIndex - sliderCtrl.previousSliderItemIndex) * sliderItemWidth;
            } else {
              // Slide to left
              offset = offset + (sliderCtrl.previousSliderItemIndex - sliderCtrl.currentSliderItemIndex) * sliderItemWidth;
            }
            _setContainerOffset();

            // After slide
            if(newCurrent.length > 0) {
              $log.log('set width', currentSliderItemWidth);
              _setWidth(newCurrent, currentSliderItemWidth);
              newCurrentContent = angular.element(newCurrent[0].getElementsByClassName('content'));
              newCurrent.addClass('slider__item_current');
              // newCurrentContent.removeClass('content_content-center');

              slideTimer = $timeout(function() {
                newCurrent.addClass('slider__item_details');

                $timeout(function() {
                  sliderCtrl.executeCallback();
                }, 400);
              }, 400);
            }
          }
        }


        angular.element($window).on('resize', function() {
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
