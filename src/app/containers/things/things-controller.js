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

  ThingsCtrl.$inject = ['app', 'libs', '$element', '$scope', '$log', '$state', '$stateParams', 'DSDevice', 'NavigationBar', 'ActionBar', 'ModalContainer'];

  /**
   * @ngdoc controller
   * @name guh.containers.controller:ThingsCtrl
   * @description Container component for things.
   *
   */
  function ThingsCtrl(app, libs, $element, $scope, $log, $state, $stateParams, DSDevice, NavigationBar, ActionBar, ModalContainer) {
    
    var vm = this;

    vm.showActionBar = false;
    vm.showList = false;
    vm.showFilter = false;

    vm.$onInit = $onInit;
    vm.toggleFilter = toggleFilter;
    vm.filter = filter;
    vm.addThing = addThing;
    vm.showDetails = showDetails;
    vm.isDisabled = isDisabled;
    

    function $onInit() {
      $element.addClass('Things');

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

      _initNavigation();
      _initActions();

      vm.configuredDevices = DSDevice.getAll();

      // Set disabled status (e.g. for when device is not reachable)
      vm.configuredDevices = vm.configuredDevices.map(function(device) {
        device.isDisabled = vm.isDisabled(device);
        return device;
      });

      // TODO: Animate fading in tile-list
      vm.showActionBar = true;
      if(!deviceId) {
        vm.showList = true;
      }

      tags = libs._.uniq([].concat.apply([], vm.configuredDevices.map(_getTags)));
      vm.filterItems = tags.map(_getFilterItem);
    }

    function _initNavigation() {
      NavigationBar.changeItems([
        {
          position: 1,
          label: 'Things',
          state: 'guh.things'
        },
        {
          position: 2,
          label: 'Rules',
          state: 'guh.rules'
        },
        {
          position: 3,
          label: 'Settings',
          state: 'guh.settings'
        }
      ]);
    }

    function _initActions() {
      ActionBar.changeItems([
        {
          position: 1,
          iconUrl: './assets/svg/ui/ui.symbol.svg#search',
          callback: toggleFilter,
          isToggle: true,
          toggleValue: false
        },
        {
          position: 2,
          iconUrl: './assets/svg/ui/ui.symbol.svg#plus',
          callback: addThing
        }
      ]);
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
      ActionBar.changeItems([
        {
          position: 1,
          iconUrl: './assets/svg/ui/ui.symbol.svg#search',
          callback: toggleFilter,
          isToggle: true,
          toggleValue: !vm.showFilter
        },
        {
          position: 2,
          iconUrl: './assets/svg/ui/ui.symbol.svg#plus',
          callback: addThing
        }
      ]);
      vm.showFilter = !vm.showFilter;
    }

    function filter(filterItems) {
      vm.filterItems = filterItems;
    }

    function addThing() {
      ModalContainer
        .add({
          controller: ['modalInstance', function(modalInstance) {
            this.modalInstance = modalInstance;
          }],
          controllerAs: 'modal',
          data: null,
          template: '<guh-add-thing modal-instance="modal.modalInstance"></guh-add-thing>'
        })
        .then(function(modal) {
          modal.open();
        })
        .catch(function(error) {
          $log.log('error', error);
        });
    }

    function showDetails(tileId) {
      $state.go('guh.thingDetails', {
        deviceId: tileId
      });
      // TODO: Animate morphing the tile-item to show thing details
      vm.showActionBar = false;
      vm.showList = false;
    }

    function isDisabled(device) {
      if(angular.isDefined(device.deviceClass.criticalStateTypeId)) {
        var criticalStateTypes = device.deviceClass.stateTypes.filter(function(stateType) {
          return stateType.id === device.deviceClass.criticalStateTypeId;
        });

        // Should be exactly one criticalStateType
        if(angular.isDefined(criticalStateTypes[0])) {
          var criticalStates = device.states.filter(function(state) {
            return state.stateType.id === criticalStateTypes[0].id;
          });

          // Should be exactly one state
          // The value is inverted because the values are something like: "reachable": false => means the the device is not reachable, so it should be disabled in the view
          return !criticalStates[0].value;
        }
      }

      return false;
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
