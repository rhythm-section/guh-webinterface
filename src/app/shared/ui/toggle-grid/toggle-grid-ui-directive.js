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
    .directive('guhToggleGrid', guhToggleGrid);

    guhToggleGrid.$inject = ['$log', 'hotkeys'];

    function guhToggleGrid($log, hotkeys) {
      var directive = {
        link: guhToggleGridLink,
        restrict: 'A'
      };

      return directive;


      function guhToggleGridLink(scope, element, attrs) {

        var key = 'ctrl+g';
        var gridClass = 'grid-overlay';


        /*
         * Private methods
         *
         */

        var _init = function() {
          // Add grid-class if it should be enabled by default
          if(attrs.guhToggleGrid && attrs.guhToggleGrid === 'show') {
            element.addClass(gridClass);
          }

          // Add hotkey to toggle the grid
          hotkeys.add({
            combo: key,
            description: 'Toggles the layout grid for CSS development.',
            callback: scope.toggle
          });
        }


        /*
         * Public methods
         *
         */

        scope.toggle = function() {
          element.toggleClass(gridClass);
        }


        /*
         * Events
         *
         */

        // Remove the hotkey if the directive is destroyed:
        element.bind('$destroy', function() {
          hotkeys.del(scope.key);
        });


        /*
         * Initialize
         */

        _init();

      }
    }

}());
