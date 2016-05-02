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
 * @name guh.devices.controller:DevicesMasterCtrl
 *
 * @description
 * Load and list configured devices.
 *
 */

(function(){
  'use strict';

  angular
    .module('guh.devices')
    .controller('DevicesMasterCtrl', DevicesMasterCtrl);

  DevicesMasterCtrl.$inject = ['$log', '$scope', '$filter', '$state', '$stateParams', 'libs', 'DS', 'DSDevice'];

  function DevicesMasterCtrl($log, $scope, $filter, $state, $stateParams, libs, DS, DSDevice) {
    
    // Don't show debugging information
    DSDevice.debug = false;

    var vm = this;

    // Public variables
    vm.configured = [];
    vm.currentSlide = 0;

    // Public methods
    vm.setCurrent = setCurrent;


    /**
     * @ngdoc interface
     * @name _init
     * @methodOf guh.devices.controller:DevicesMasterCtrl
     *
     * @description
     * Set data for view.
     *
     */

    function _init() {
      var devices = DSDevice.getAll();

      if(libs._.size(DS.store.device.completedQueries) <= 1) {
        $state.go('guh.intro', {
          previousState: {
            name: $state.current.name,
            params: {}
          }
        });
      }

      var configuredDevices = [];
      devices.forEach(function(device) {
        device.name = (device.name === 'Name') ? device.deviceClass.name : device.name;

        if(device.deviceClass.classType === 'device' || device.deviceClass.classType === 'gateway') {
          configuredDevices.push(device);
        }
      });

      // Sort by name
      vm.configured = $filter('orderBy')(configuredDevices, 'name');
    }


    function setCurrent(index) {
      vm.currentSlide = index;
      
      if(index !== -1) {
        $state.go('guh.devices.master.current', { deviceId: vm.configured[index].id });
      }
    }


    $scope.$on('ReloadView', function(event, data) {
      $log.log('Reload view!', event, data);

      $state.go($state.current, $stateParams, {
        reload: true,
        inherit: false,
        notify: true
      });
    });

    
    _init();

  }

}());
