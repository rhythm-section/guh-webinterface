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
    .controller('NewDeviceCtrl', NewDeviceCtrl);

  NewDeviceCtrl.$inject = ['$log', '$rootScope', '$scope', '$state', '$stateParams', 'app', 'libs', 'DSHttpAdapter', 'DSVendor', 'DSDevice', 'modalInstance'];

  function NewDeviceCtrl($log, $rootScope, $scope, $state, $stateParams, app, libs, DSHttpAdapter, DSVendor, DSDevice, modalInstance) {

    var vm = this;

    // Public variables
    vm.supportedVendors = [];
    vm.modalInstance = modalInstance;
    vm.deviceClassId = '';
    vm.deviceDescriptorId = '';
    vm.deviceParams = [];
    vm.name = '';

    // Public methods
    vm.reset = reset;
    vm.selectVendor = selectVendor;
    vm.selectDeviceClass = selectDeviceClass;
    vm.discoverDevices = discoverDevices;
    vm.back = back;
    vm.create = create;
    vm.confirmPairing = confirmPairing;
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
        if(!libs._.includes(vm.supportedVendors, vendor) && (createMethod.title !== 'Auto' && (deviceClass.classType === 'device' || deviceClass.classType === 'gateway'))) {
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

        if(createMethod.title !== 'Auto' && (deviceClass.classType === 'device' || deviceClass.classType === 'gateway')) {
          vm.supportedDeviceClasses.push(deviceClass);
        }
      });

      // Next step
      $rootScope.$broadcast('wizard.next', 'newDevice');
    }

    function selectDeviceClass(deviceClass) {
      // Reset
      vm.selectedDeviceClass = null;
      vm.createMethod = '';
      vm.setupMethod = '';
      vm.params = [];
      vm.discoveredDevices = [];

      vm.selectedDeviceClass = deviceClass;
      vm.createMethod = deviceClass.getCreateMethod();
      vm.setupMethod = deviceClass.getSetupMethod();
      vm.deviceClassId = vm.selectedDeviceClass.id;

      // Next step
      if(vm.createMethod.title === 'User') {
        if(vm.selectedDeviceClass.paramTypes.length > 0) {
          $rootScope.$broadcast('wizard.next', 'newDevice');
        } else {
          $rootScope.$broadcast('wizard.goToStep', 'newDevice', 4);
        }
      } else {
        $rootScope.$broadcast('wizard.next', 'newDevice');
      }
    }

    function discoverDevices(params) {
      // Reset
      vm.params = [];
      
      vm.discover = false;
      vm.loading = true;
      vm.params = angular.copy(params);

      vm.selectedDeviceClass
        .discover(params)
        .then(function(data) {
          vm.discover = true;
          vm.loading = false;
          vm.discoveredDevices = data.deviceDescriptors;
          // vm.discoveredDevices = discoveredDevices.data;
          // vm.discoveredDevices = discoveredDevices.deviceDescriptors;
        })
        .catch(function(error) {
          vm.discover = true;
          vm.loading = false;
          $log.error(error);
        });
    }

    function pairDevice() {
      DSDevice
        .pair(vm.deviceClassId, vm.deviceDescriptorId, vm.deviceParams, vm.name)
        .then(function(pairingData) {
          // vm.displayMessage = pairingData.data.displayMessage;
          // vm.pairingTransactionId = pairingData.data.pairingTransactionId;
          vm.displayMessage = pairingData.displayMessage;
          vm.pairingTransactionId = pairingData.pairingTransactionId;

          // Next step
          $rootScope.$broadcast('wizard.next', 'newDevice');
        })
        .catch(function(error) {
          $log.error(error);
        });
    }

    function back() {
      // Previous step
      $rootScope.$broadcast('wizard.prev', 'newDevice');
    }

    function create(deviceData) {
      vm.deviceDescriptorId = (angular.isDefined(deviceData) && angular.isString(deviceData.id)) ? deviceData.id : '';
      vm.deviceParams = (vm.deviceDescriptorId === '' && angular.isDefined(deviceData) && angular.isArray(deviceData)) ? deviceData : [];

      $rootScope.$broadcast('wizard.next', 'newDevice');
    }

    function confirmPairing(params) {
      var secret = libs._.find(params, function(param) {
        return param.name === 'Secret';
      });
      var secretValue = angular.isDefined(secret) ? secret.value : undefined;

      DSDevice
        .confirmPairing(vm.pairingTransactionId, secretValue)
        .then(function(data) {
          /* jshint unused:true */
          modalInstance.close();
        })
        .catch(function(error) {
          $log.error(error);
        });
    }

    function save() {
      // Without setupMethod the device can be saved directly
      if(vm.setupMethod) {
        pairDevice();
      } else {
        DSDevice
          .add(vm.deviceClassId, vm.deviceDescriptorId, vm.deviceParams, vm.name)
          .then(function(data) {
            /* jshint unused:true */
            modalInstance.close();
          })
          .catch(function(error) {
            $log.log(error);
          });
      }
    }


    _init();

  }

}());
