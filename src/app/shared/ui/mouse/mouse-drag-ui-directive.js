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
 

// https://github.com/ozantunca/angular-mousedrag/blob/master/ng-mousedrag.js
(function() {
  'use strict';

  angular
    .module('guh.ui')
    .directive('guhMouseDrag', mouseDrag);

    mouseDrag.$inject = ['$log', '$document'];

    function mouseDrag($log, $document) {
      var directive = {
        link: mouseDragLink,
        restrict: 'A'
      };

      return directive;


      function mouseDragLink(scope, element, attrs) {
        var endTypes = 'touchend mouseup';
        var moveTypes = 'touchmove mousemove';
        var startTypes = 'touchstart mousedown';
        var startX;
        var startY;


        element.bind(startTypes, _startDrag);


        /*
         * Private methods
         */

        function _startDrag(event) {
          event.preventDefault();
          startX = event.pageX;
          startY = event.pageY;

          $document.bind(moveTypes, _drag);
          $document.bind(endTypes, _stopDrag);
        }

        function _drag(event) {
          event.dragX = event.pageX - startX;
          event.dragY = event.pageY - startY;

          scope.$event = event;
          scope.$apply(attrs.guhMouseDrag);
        }

        function _stopDrag() {
          $document.unbind(moveTypes);
        }
      }
    }

}());
