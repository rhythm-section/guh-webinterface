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
 * @name guh.devices.controller:DevicesDetailCtrl
 *
 * @description
 * Load and show details of certain device.
 *
 */

(function(){
  'use strict';

  angular
    .module('guh.moods')
    .controller('EditMoodCtrl', EditMoodCtrl);

  EditMoodCtrl.$inject = ['$log', '$rootScope', '$scope', '$state', '$stateParams', 'DSRule', 'DSDevice', 'modalInstance'];

  function EditMoodCtrl($log, $rootScope, $scope, $state, $stateParams, DSRule, DSDevice, modalInstance) {

    var vm = this;

    // Public variables
    vm.rule = {};
    vm.ruleId = '';
    vm.modalInstance = modalInstance;

    // Public methods
    vm.remove = remove;


    function _init() {
      vm.ruleId = $stateParams.moodId;

      _findRule(vm.ruleId)
        .then(function(rule) {
          vm.rule = rule;
        });
    }

    function _findRule(ruleId) {
      return DSRule.find(ruleId);
    }

    function _removeRule() {
      return vm.rule.remove();
    }

    function _removeToggleButton(devices) {
      var devices = DSDevice.getAll();

      $log.log('devices', devices);

      angular.forEach(devices, function(device) {
        var ruleIdPart = device.name.substring(device.name.lastIndexOf('{') + 1, device.name.lastIndexOf('}'));

        if('{' + ruleIdPart + '}' === vm.ruleId) {
          $log.log('Remove device');
          $log.log(device.name, vm.ruleId);

          // Remove device
          device
            .remove()
            .then(function() {
              modalInstance.close();

              $state.go('guh.moods.master', { bypassCache: true }, {
                reload: true,
                inherit: false,
                notify: true
              });
            })
            .catch(function(error) {
              $log.error('guh.moods.EditMoodCtrl:controller - ', error);
            });
        }
      });
    }

    function remove() {
      _removeRule()
        .then(_removeToggleButton)
        .catch(function(error) {
          $log.error('guh.moods.EditMoodCtrl:controller - ', error);
        });
    }

    _init();

  }

}());
