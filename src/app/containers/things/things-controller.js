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
    .module('guh.containers')
    .controller('ThingsCtrl', ThingsCtrl);

  ThingsCtrl.$inject = ['app', 'libs', '$scope', '$log', '$state', '$stateParams', 'DSDevice', 'ModalContainer'];

  /**
   * @ngdoc controller
   * @name guh.containers.controller:ThingsCtrl
   * @description Container component for things.
   *
   */
  function ThingsCtrl(app, libs, $scope, $log, $state, $stateParams, DSDevice, ModalContainer) {
    
    var vm = this;

    vm.showActionBar = false;
    vm.showList = false;
    vm.showFilter = false;

    vm.$onInit = onInit;
    vm.toggleFilter = toggleFilter;
    vm.filter = filter;
    vm.addThing = addThing;
    vm.showDetails = showDetails;
    

    function onInit() {
      var deviceId = (libs._.has($stateParams, 'deviceId') && $stateParams.deviceId) ? $stateParams.deviceId : null;
      var tags = [];
      
      if(!app.dataLoaded) {
        $state.go('guh.intro', {
          previousState: {
            name: $state.current.name,
            params: {
              deviceId: deviceId
            }
          }
        });
      }

      vm.configuredDevices = DSDevice.getAll();

      // TODO: Animate fading in tile-list
      vm.showActionBar = true;
      if(!deviceId) {
        vm.showList = true;
      }

      tags = libs._.uniq([].concat.apply([], vm.configuredDevices.map(_getTags)));
      vm.filterItems = tags.map(_getFilterItem);
    }

    function _getTags(device) {
      if(angular.isUndefined(device.deviceClass) && angular.isUndefined(device.deviceClass.basicTags)) {
        return [];
      }

      return device.deviceClass.basicTags;
    }

    function _getFilterItem(tag) {
      return {
        name: tag.replace('BasicTag', ''),
        type: tag,
        isChecked: false
      };
    }

    function toggleFilter() {
      vm.showFilter = !vm.showFilter;
    }

    function filter(filterItems) {
      $log.log('filter', filterItems);
      vm.filterItems = filterItems;
    }

    function addThing() {
      ModalContainer
        .add({
          controller: 'NewDeviceCtrl',
          controllerAs: 'newDevice',
          data: null,
          templateUrl: 'app/components/devices/add/new-device-modal.html'
        })
        .then(function(modal) {
          modal.open();
        })
        .catch(function(error) {
          $log.log('error', error);
        });
    }

    function showDetails(tileId) {
      $state.go('guh.things.current', {
        deviceId: tileId
      });
      // TODO: Animate morphing the tile-item to show thing details
      vm.showActionBar = false;
      vm.showList = false;
    }


    $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options) {
      if(toState.name === 'guh.things') {
        // TODO: Animate morphing the tile-item back to the tile-list
        vm.showActionBar = true;
        vm.showList = true;
      }
    });

  }

}());
