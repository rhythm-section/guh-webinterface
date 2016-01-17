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


/**
 * @ngdoc interface
 * @name guh.moods.controller:MoodsMasterCtrl
 *
 * @description
 * Load and list configured moods.
 *
 */

(function(){
  'use strict';

  angular
    .module('guh.moods')
    .controller('MoodsMasterCtrl', MoodsMasterCtrl);

  MoodsMasterCtrl.$inject = ['$log', '$filter', '$state', '$stateParams', 'app', 'DSRule', 'DSDevice'];

  function MoodsMasterCtrl($log, $filter, $state, $stateParams, app, DSRule, DSDevice) {

    // Don't show debugging information
    DSRule.debug = false;

    var vm = this;
    
    // Public variables
    vm.configured = [];

    // Public methods
    vm.setCurrent = setCurrent;


    function _init() {
      var moods = DSRule.getAll();

      if(!app.dataLoaded) {
        $state.go('guh.intro', {
          previousState: {
            name: $state.current.name,
            params: {}
          }
        });
      } else {
        // Sort by name
        vm.configured = $filter('orderBy')(moods, 'name');

        angular.forEach(vm.configured, function(rule) {
          rule.actionDeviceNames = [];
          angular.forEach(rule.actions, function(action) {
            var actionDevice = DSDevice.get(action.deviceId);
            rule.actionDeviceNames.push(actionDevice.name);
          });
        });
      }
    }


    function setCurrent(index) {
      vm.currentSlide = index;

      if(index !== -1 && index <= vm.configured.length) {
        $state.go('guh.moods.master.current', { moodId: vm.configured[index].id });
      }
    }


    _init();

  }

}());
