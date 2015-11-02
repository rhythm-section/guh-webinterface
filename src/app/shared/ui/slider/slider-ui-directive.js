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
        // DOM Elements
        var contentContainer = angular.element(element[0].getElementsByClassName('slider__content-container'));
        var sliderItems = element[0].getElementsByClassName('slider__item');

        var viewportWidth = $window.innerWidth;
        var slideTimer;

        var columnCount;
        var dummyColumnCount;
        var currentSliderItemWidth;
        var sliderItemWidth;

        // var columnCount = 5;
        // var dummyColumnCount = Math.floor((columnCount - 1) / 2);
        // var currentSliderItemWidth = Math.floor(viewportWidth / 100 * 40);
        // var sliderItemWidth = Math.floor(viewportWidth / 100 * 20);

        var containerWidth = 0;
        var offset = 0;

        // Breakpoint settings
        var viewportWidth = $window.innerWidth;
        var previousBreakpoint = {};
        var currentBreakpoint = {};
        var breakpoints = {
          xs: {
            columnCount: 3,
            currentSliderItemWidth: 80,
            sliderItemWidth: 20,
            minWidth: null,
            maxWidth: 480
          },
          s: {
            columnCount: 3,
            currentSliderItemWidth: 80,
            sliderItemWidth: 20,
            minWidth: 481,
            maxWidth: 640
          },
          m: {
            columnCount: 3,
            currentSliderItemWidth: 60,
            sliderItemWidth: 40,
            minWidth: 641,
            maxWidth: 1024
          },
          l: {
            columnCount: 5,
            currentSliderItemWidth: 40,
            sliderItemWidth: 20,
            minWidth: 1025,
            maxWidth: 1280
          },
          xl: {
            columnCount: 5,
            currentSliderItemWidth: 40,
            sliderItemWidth: 20,
            minWidth: 1281,
            maxWidth: 1600
          },
          xxl: {
            columnCount: 5,
            currentSliderItemWidth: 40,
            sliderItemWidth: 20,
            minWidth: 1601,
            maxWidth: null
          }
        };


        // Link methods
        sliderCtrl.setWidth = setWidth;
        sliderCtrl.setCurrent = setCurrent;
        

        function _init() {
          element.addClass('slider');
          _initSliderDom();

          // _setBreakpoint();
          // _setDummyElements();
          // offset = offset -(sliderItemWidth / 2);
          // _setContainerOffsetCss();
          

          sliderCtrl.init();
        }

        function _initSliderDom() {
          viewportWidth = $window.innerWidth;

          _setBreakpoint();

          // Set dummyElements
          _setDummyElements();

          // Set sliderItems width
          angular.forEach(sliderCtrl.sliderItems, function(sliderItem) {
            if(sliderItem.element.hasClass('slider__item-current')) {
              _setWidthCss(sliderItem.element, Math.floor(currentSliderItemWidth));
            } else {
              _setWidthCss(sliderItem.element, Math.floor(sliderItemWidth));
            }
          });
          _setWidthCss(contentContainer, Math.floor(containerWidth));

          // Set container offset
          if(sliderCtrl.currentSliderItemIndex === -1 || sliderCtrl.currentSliderItemIndex === 0) {
            offset = -(sliderItemWidth / 2);
          } else {
            offset = -(sliderItemWidth / 2) - (sliderCtrl.currentSliderItemIndex * sliderItemWidth);
          }
          _setContainerOffsetCss();
        }

        function _setBreakpoint() {
          previousBreakpoint = currentBreakpoint;

          // Set breakpoint data
          angular.forEach(breakpoints, function(breakpoint) {
            if(viewportWidth &&
               breakpoint.minWidth &&
               breakpoint.maxWidth &&
               viewportWidth >= breakpoint.minWidth &&
               viewportWidth <= breakpoint.maxWidth) {
               currentBreakpoint = breakpoint;
            } else if(viewportWidth &&
                      breakpoint.minWidth &&
                      !breakpoint.maxWidth &&
                      viewportWidth >= breakpoint.minWidth) {
                      currentBreakpoint = breakpoint;
            } else if(viewportWidth &&
                      !breakpoint.minWidth &&
                      breakpoint.maxWidth &&
                      viewportWidth <= breakpoint.maxWidth) {
                      currentBreakpoint = breakpoint;
            }
          });

          // Calculate new widths
          columnCount = currentBreakpoint.columnCount;
          dummyColumnCount = Math.floor((columnCount - 1) / 2);
          currentSliderItemWidth = Math.floor(viewportWidth / 100 * currentBreakpoint.currentSliderItemWidth);
          sliderItemWidth = Math.floor(viewportWidth / 100 * currentBreakpoint.sliderItemWidth);
          containerWidth = (sliderCtrl.sliderItems.length - 1) * sliderItemWidth + currentSliderItemWidth + (currentBreakpoint.columnCount - 1) * sliderItemWidth;
        }

        function _setDummyElements() {
          var i = 0;

          // Remove current dummy elements
          angular.element(element[0].getElementsByClassName('slider__item-dummy')).remove();

          // Add dummy elements for start/end
          for(i; i < dummyColumnCount; i++) {
            var dummySliderItemBefore = angular.element('<div class="slider__item-dummy"></div>');
            dummySliderItemBefore.css({
              width: sliderItemWidth + 'px'
            });
            var dummySliderItemAfter = angular.copy(dummySliderItemBefore);

            // _setWidthCss(dummySliderItemBefore, sliderItemWidth);
            // _setWidthCss(dummySliderItemAfter, sliderItemWidth);

            contentContainer.prepend(dummySliderItemBefore);
            contentContainer.append(dummySliderItemAfter);
          }

        }
  
        function _setWidthCss(element, width) {
          var paddingLeft = parseFloat($window.getComputedStyle(element[0], null).getPropertyValue('padding-left'));
          var paddingRight = parseFloat($window.getComputedStyle(element[0], null).getPropertyValue('padding-right'));

          if(paddingLeft + paddingRight > width) {
            element.css({
              'padding-left': Math.floor(width / 2) + 'px',
              'padding-right': Math.floor(width / 2) + 'px',
              width: width + 'px'
            });
          } else {
            if(element.hasClass('slider__item')) {
              element.removeAttr('style');  
            }
            
            element.css({
              width: width + 'px'
            });
          }
        }

        function _setContainerOffsetCss() {
          contentContainer.css({
            '-webkit-transform': 'translateX(' + offset + 'px)',
                '-ms-transform': 'translateX(' + offset + 'px)',
                    'transform': 'translateX(' + offset + 'px)'
          });
        }

        function setWidth() {
          var newSliderItemElement = sliderCtrl.sliderItems[sliderCtrl.sliderItems.length - 1].element;
          containerWidth = (sliderCtrl.sliderItems.length - 1) * sliderItemWidth + currentSliderItemWidth + (columnCount - 1) * sliderItemWidth;

          if(newSliderItemElement.hasClass('slider__item-current')) {
            _setWidthCss(newSliderItemElement, currentSliderItemWidth);
          } else {
            _setWidthCss(newSliderItemElement, sliderItemWidth);
          }

          _setWidthCss(contentContainer, containerWidth);
        }

        function setCurrent() {
          if(sliderCtrl.currentSliderItemIndex !== -1) {
            var oldCurrent = angular.element(element[0].getElementsByClassName('slider__item-current'));
            var oldCurrentContent;
            var newCurrent = sliderCtrl.sliderItems[sliderCtrl.currentSliderItemIndex].element;
            var newCurrentContent;
            var halfSliderItemWidth = Math.floor(sliderItemWidth / 2);


            // Cancel timer to set new widths and positions
            $timeout.cancel(slideTimer);

            // Before slide
            if(oldCurrent.length > 0) {
              oldCurrent.removeClass('slider__item-details');
              oldCurrent.removeClass('slider__item-current');
              _setWidthCss(oldCurrent, sliderItemWidth);
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
            _setContainerOffsetCss();

            // After slide
            if(newCurrent.length > 0) {
              _setWidthCss(newCurrent, currentSliderItemWidth);
              newCurrentContent = angular.element(newCurrent[0].getElementsByClassName('content'));
              newCurrent.addClass('slider__item-current');
              // newCurrentContent.removeClass('content_content-center');

              slideTimer = $timeout(function() {
                newCurrent.addClass('slider__item-details');

                $timeout(function() {
                  sliderCtrl.executeCallback();
                }, 400);
              }, 400);
            }
          }
        }


        angular.element($window).on('resize', function() {
          _initSliderDom();
        });


        _init();

      }
    }
}());
