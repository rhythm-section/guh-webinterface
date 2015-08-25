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

  NewDeviceCtrl.$inject = ['$log', '$rootScope', '$scope', '$state', '$stateParams', 'DSVendor', 'DSDevice'];

  function NewDeviceCtrl($log, $rootScope, $scope, $state, $stateParams, DSVendor, DSDevice) {

    var vm = this;

    // Public variables

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
      // vm.showVendors = true;
      // vm.showDeviceClasses = false;
      // vm.showCreateMethod = false;
      // vm.showSetupMethod = false;

      _findAllVendors()
        .then(function(vendors) {
          vm.supportedVendors = vendors;
        });
    }

    function _findAllVendors() {
      return DSVendor.findAll();
    }

    function _findVendorRelations() {
      return DSVendor.loadRelations(vendor, ['deviceClass']);
    }

    function reset() {
      _init();
    }

    function selectVendor(vendor) {
      // Check relations & set selected vendor
      if(angular.isUndefined(vendor.deviceClass) && vendor.deviceClass === {}) {
        _findVendorRelations()
          .then(function(vendor) {
            vm.selectedVendor = vendor;
          });
      } else {
        vm.selectedVendor = vendor;
      }

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

    function selectDeviceClass(deviceClass) {
      vm.selectedDeviceClass = deviceClass;
      vm.createMethod = deviceClass.getCreateMethod();
      vm.setupMethod = deviceClass.getSetupMethod();

      // Next step
      $rootScope.$broadcast('wizard.next', 'newDevice');
    }

    function discoverDevices(params) {
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

    // deviceData can be device information (discovered device) or params (user created device)
    function add(deviceData) {
      var deviceClassId = vm.selectedDeviceClass.id;
      var deviceDescriptorId = (angular.isDefined(deviceData) && angular.isString(deviceData.id)) ? deviceData.id : '';
      var deviceParams = (deviceDescriptorId === '' && angular.isDefined(deviceData) && angular.isArray(deviceData)) ? deviceData : [];

      $log.log('add', deviceClassId, deviceDescriptorId, deviceParams);

      // Without setupMethod the device can be saved directly
      if(vm.setupMethod) {
        pairDevice(deviceClassId, deviceDescriptorId, deviceParams);
      } else {
        save(deviceClassId, deviceDescriptorId, deviceParams);
      }
    }

    function save(deviceClassId, deviceDescriptorId, deviceParams) {
      $log.log('Close modal: save', deviceClassId, deviceDescriptorId, deviceParams);

      DSDevice
        .add(deviceClassId, deviceDescriptorId, deviceParams)
        .then(function(device) {
          $log.log('device saved', device);

          DSDevice
            .inject({
              deviceClassId: deviceClassId,
              id: device.id,
              name: device.name,
              params: deviceParams,
              setupComplete: true
            });

          $scope.closeThisDialog();

          // $state.go('guh.rules.master', { bypassCache: true }, { reload: true });
          $state.go('guh.devices.master', { bypassCache: true }, {
            reload: true,
            inherit: false,
            notify: true
          });
        })
        .catch(function(error) {
          $log.log(error);
        });


      $log.log('$scope', $scope);

      // vm.closeModal({
      //   device: {
      //     deviceClassId: vm.selectedDeviceClass.id,
      //     deviceData: deviceData
      //   },
      //   httpCreate: true
      // });
    }


    _init();

  }

}());
