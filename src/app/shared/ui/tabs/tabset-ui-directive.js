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
    .directive('guhTabset', guhTabset);

    guhTabset.$inject = ['$log', '$sce', 'libs', 'hotkeys'];

    function guhTabset($log, $sce, libs, hotkeys) {
      var directive = {
        bindToController: {},
        controller: tabsetCtrl,
        controllerAs: 'tabset',
        link: tabsetLink,
        restrict: 'E',
        scope: {},
        templateUrl: 'app/shared/ui/tabs/tabset.html',
        transclude: true
      };

      return directive;


      function tabsetCtrl($scope) {
        
        /* jshint validthis: true */
        var vm = this;
        vm.init = init;

        /*
         * Variables
         */
        vm.tabs = [];
        vm.tabHeadings = [];

        /*
         * Methods
         */
        vm.addTab = addTab;
        vm.selectTab = selectTab;

        function _addHotkeys() {
          var tabLengthArray = [];
          var hotkey = '';
          var hotkeyIndex = 0;

          angular.forEach(vm.tabs, function(tab) {
            tabLengthArray.push(tab.heading.length);
          });

          while(hotkeyIndex < libs._.min(tabLengthArray)) {
            var hotkeyArray = [];
            angular.forEach(vm.tabs, function(tab) {
              hotkeyArray.push(tab.heading.charAt(hotkeyIndex).toLowerCase());
            });

            // If some of the hotkeys are the same check characters on the next index
            if(hotkeyArray.length !== libs._.uniq(hotkeyArray).length) {
              hotkeyIndex++;
            } else {
              // Index found
              break;
            }
          }

          angular.forEach(vm.tabs, function(tab, index) {
            vm.tabHeadings[index] = $sce.trustAsHtml(tab.heading.slice(0, hotkeyIndex) + '<span>' + tab.heading.slice(hotkeyIndex, hotkeyIndex + 1) + '</span>' + tab.heading.slice(hotkeyIndex + 1));
            
            hotkey = tab.heading.charAt(hotkeyIndex).toLowerCase();

            // Bind hotkey only if combo is letter (a-z)
            if(hotkey.match(/[a-z]/)) {
              tab.hotkey = true;

              hotkeys
                .bindTo($scope)
                .add({
                  combo: hotkey,
                  description: tab.heading,
                  callback: function(event, hotkey) {
                    event.preventDefault();

                    angular.forEach(vm.tabs, function(tab) {
                      if(tab.heading === hotkey.description) {
                        selectTab(tab);
                      }
                    });
                  }
                });
            } else {
              tab.hotkey = false;
            }
          });
        }


        function init() {
          _addHotkeys();
        }

        function addTab(tab) {
          vm.tabs.push(tab);

          // Set first tab active
          if(vm.tabs.length === 1) {
            tab.active = true;
          }
        }

        function selectTab(selectedTab) {
          angular.forEach(vm.tabs, function(tab) {
            if(tab.active && tab !== selectedTab) {
              tab.active = false;
            }
          });

          selectedTab.active = true;
        }
      }


      function tabsetLink(scope, element, attrs, tabsetCtrl) {
        /* jshint unused: false */
        tabsetCtrl.init();
      }
    }

}());