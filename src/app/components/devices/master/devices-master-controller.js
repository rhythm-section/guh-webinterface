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

  DevicesMasterCtrl.$inject = ['$log', '$stateParams', 'app', 'initialData', 'DS', 'DSVendor', 'DSDeviceClass', 'DSDevice', 'ngDialog'];

  function DevicesMasterCtrl($log, $stateParams, app, initialData, DS, DSVendor, DSDeviceClass, DSDevice, ngDialog) {
    
    // Don't show debugging information
    DSVendor.debug = false;
    DSDeviceClass.debug = false;
    DSDevice.debug = false;

    var vm = this;

    // Public variables
    vm.configured = [];

    // Public methods
    vm.add = add;


    /**
     * @ngdoc interface
     * @name _loadViewData
     * @methodOf guh.devices.controller:DevicesMasterCtrl
     *
     * @description
     * Set data for view.
     * 
     * @param {boolean} bypassCache True if devices should be requested from Server instead of application memory (datastore)
     *
     */

    function _loadViewData(bypassCache) {
      $log.log('_loadViewData', $stateParams);

      _findAllDevices(bypassCache)
        .then(_findDeviceRelations)
        .then(function(devices) {
          devices.forEach(function(device) {
            device.name = (device.name === 'Name') ? device.deviceClass.name : device.name;

            if(device.deviceClass.classType === 'device' || device.deviceClass.classType === 'gateway') {
              vm.configured.push(device);
            }
          });
        });
    }


    /**
     * @ngdoc interface
     * @name _findAllDevices
     * @methodOf guh.devices.controller:DevicesMasterCtrl
     *
     * @description
     * Load configured devices with there relations (deviceClass, vendor).
     * 
     * @param {boolean} bypassCache True if devices should be requested from Server instead of application memory (datastore)
     * @returns {Array} Promise of DSDevice Objects enhanced with relational data (deviceClass, vendor)
     *
     */

    function _findAllDevices(bypassCache) {
      // if(bypassCache) {
        return DSDevice.findAll({}, { bypassCache: true });
      // }
      
      // return DSDevice.findAll();
    }


    /**
     * @ngdoc interface
     * @name _findDeviceRelations
     * @methodOf guh.devices.controller:DevicesMasterCtrl
     *
     * @description
     * Load device relation (deviceClass) for each of configured devices.
     * 
     * @param {DSDevice} devices List of devices.
     * @returns {Array} Promise of DSDevice Objects enhanced with relational data (deviceClass)
     *
     */

    function _findDeviceRelations(devices) {
      return angular.forEach(devices, function(device) {
        return DSDevice
          .loadRelations(device, ['deviceClass', 'state'])
          .then(_findDeviceClassRelations);
      });
    }


    /**
     * @ngdoc interface
     * @name _findDeviceClassRelations
     * @methodOf guh.devices.controller:DevicesMasterCtrl
     *
     * @description
     * Load deviceClass relation (vendor) for configured device.
     * 
     * @param {DSDevice} device Device object with related deviceClass
     * @returns {Object} Promise of DSDeviceClass Object enhanced with relational data (vendor)
     *
     */

    function _findDeviceClassRelations(device) {
      return DSDeviceClass.loadRelations(device.deviceClass, ['vendor']);
    }


    /**
     * @ngdoc interface
     * @name add
     * @methodOf guh.devices.controller:DevicesMasterCtrl
     *
     * @description
     * Add a new device
     *
     */

    function add() {
      ngDialog.open({
        className: 'ngdialog-theme-default',
        controller: 'NewDeviceCtrl',
        controllerAs: 'newDevice',
        overlay: false,
        preCloseCallback: function(value) {
          if(confirm('Are you sure you want to close without saving your changes?')) {
            return true;
          }
          return false;
        },
        template: 'app/components/devices/add/new-device-modal.html'
      });
    }

    
    // Initialize controller
    // if(angular.isDefined(initialData) && angular.isDefined(initialData.devices)) {
    //   _loadViewData(true);
    // } else {
      _loadViewData(false);
    // }

  }

}());
