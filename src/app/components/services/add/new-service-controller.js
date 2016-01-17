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
    .module('guh.devices')
    .controller('NewServiceCtrl', NewServiceCtrl);

  NewServiceCtrl.$inject = ['$log', '$rootScope', '$scope', '$state', '$stateParams', 'app', 'libs', 'DSHttpAdapter', 'DSVendor', 'DSDevice', 'modalInstance'];

  function NewServiceCtrl($log, $rootScope, $scope, $state, $stateParams, app, libs, DSHttpAdapter, DSVendor, DSDevice, modalInstance) {

    var vm = this;

    // Public variables
    vm.supportedVendors = [];
    vm.modalInstance = modalInstance;

    // Public methods
    vm.reset = reset;
    vm.selectVendor = selectVendor;
    vm.selectDeviceClass = selectDeviceClass;
    vm.discoverDevices = discoverDevices;
    vm.back = back;
    vm.add = add;
    vm.save = save;


    function _init() {
      // First step
      var vendors = DSVendor.getAll();

      angular.forEach(vendors, function(vendor) {
        _checkDeviceClasses(vendor); 
      });
    }

    function _checkDeviceClasses(vendor) {
      angular.forEach(vendor.deviceClasses, function(deviceClass) {
        var createMethod = deviceClass.getCreateMethod();

        // Only if vendor not already included
        if(!libs._.includes(vm.supportedVendors, vendor) && (createMethod.title !== 'Auto' && (deviceClass.classType === 'service' || deviceClass.classType === 'dev-service'))) {
          vm.supportedVendors.push(vendor);
          return;
        }
      });
    }

    function reset() {
      _init();
    }

    function selectVendor(vendor) {
      vm.selectedVendor = vendor;

      // Remove deviceClasses that are auto discovered
      vm.supportedDeviceClasses = [];
      angular.forEach(vendor.deviceClasses, function(deviceClass) {
        var createMethod = deviceClass.getCreateMethod();

        if(createMethod.title !== 'Auto' && (deviceClass.classType === 'service' || deviceClass.classType === 'dev-service')) {
          vm.supportedDeviceClasses.push(deviceClass);
        }
      });

      // Next step
      $rootScope.$broadcast('wizard.next', 'newService');
    }

    function selectDeviceClass(deviceClass) {
      // Reset
      vm.selectedDeviceClass = null;
      vm.createMethod = '';
      vm.setupMethod = '';
      vm.params = [];
      vm.discoveredDevices = [];

      var createMethod = deviceClass.getCreateMethod();
      var setupMethod = deviceClass.getSetupMethod();

      if(createMethod !== null) {
        createMethod.addTemplate = createMethod.addTemplate.replace(/device/g, 'service');
        createMethod.editTemplate = createMethod.editTemplate.replace(/device/g, 'service');
      }

      if(setupMethod !== null) {
        setupMethod.addTemplate = setupMethod.addTemplate.replace(/device/g, 'service');
        setupMethod.editTemplate = setupMethod.editTemplate.replace(/device/g, 'service');
      }

      vm.selectedDeviceClass = deviceClass;
      vm.createMethod = createMethod;
      vm.setupMethod = setupMethod;

      // Next step
      $rootScope.$broadcast('wizard.next', 'newService');
    }

    function discoverDevices(params) {
      // Reset
      vm.params = [];

      vm.discover = false;
      vm.loading = true;
      vm.params = angular.copy(params);

      vm.selectedDeviceClass
        .discover(params)
        .then(function(discoveredDevices) {
          vm.discover = true;
          vm.loading = false;
          vm.discoveredDevices = discoveredDevices.data;
        })
        .catch(function(error) {
          vm.discover = true;
          vm.loading = false;
          $log.error(error);
        });
    }

    function pairDevice(deviceClassId, deviceDescriptorId, deviceParams) {
      DSDevice
        .pair(deviceClassId, deviceDescriptorId, deviceParams)
        .then(function(pairingData) {
          vm.displayMessage = pairingData.data.displayMessage;
          vm.pairingTransactionId = pairingData.data.pairingTransactionId;

          // Next step
          $rootScope.$broadcast('wizard.next', 'newService');
        })
        .catch(function(error) {
          $log.error(error);
        });
    }

    function back() {
      // Previous step
      $rootScope.$broadcast('wizard.prev', 'newService');
    }

    // deviceData can be device information (discovered device) or params (user created device)
    function add(deviceData) {
      var deviceClassId = vm.selectedDeviceClass.id;
      var deviceDescriptorId = (angular.isDefined(deviceData) && angular.isString(deviceData.id)) ? deviceData.id : '';
      var deviceParams = (deviceDescriptorId === '' && angular.isDefined(deviceData) && angular.isArray(deviceData)) ? deviceData : [];

      // Without setupMethod the device can be saved directly
      if(vm.setupMethod) {
        pairDevice(deviceClassId, deviceDescriptorId, deviceParams);
      } else {
        save(deviceClassId, deviceDescriptorId, deviceParams);
      }
    }

    function save(deviceClassId, deviceDescriptorId, deviceParams) {
      DSDevice
        .add(deviceClassId, deviceDescriptorId, deviceParams)
        .then(function(device) {
          /* jshint unused:true */
          modalInstance.close();

          $state.go('guh.services.master', { bypassCache: true }, {
            reload: true,
            inherit: false,
            notify: true
          });
        })
        .catch(function(error) {
          $log.log(error);
        });
    }


    _init();

  }

}());
