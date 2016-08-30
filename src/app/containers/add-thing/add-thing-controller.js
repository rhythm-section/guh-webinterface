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
    .controller('AddThingCtrl', AddThingCtrl);

  AddThingCtrl.$inject = ['libs', '$log', '$rootScope', 'DSVendor', 'DSDevice'];

  /**
   * @ngdoc controller
   * @name guh.containers.controller:AddThingCtrl
   * @description Container component for adding a new thing.
   *
   */
  function AddThingCtrl(libs, $log, $rootScope, DSVendor, DSDevice) {
    
    var vm = this;

    vm.supportedVendors = [];
    vm.supportedDeviceClasses = [];
    vm.name = '';

    vm.$onInit = $onInit;
    vm.selectVendor = selectVendor;
    vm.selectDeviceClass = selectDeviceClass;
    vm.createThing = createThing;
    vm.setupThing = setupThing;
    vm.save = save;


    function $onInit() {
      var vendors = DSVendor.getAll();

      angular.forEach(vendors, function(vendor) {
        _checkDeviceClasses(vendor); 
      });
    }


    function _checkDeviceClasses(vendor) {
      angular.forEach(vendor.deviceClasses, function(deviceClass) {
        var createMethod = deviceClass.getCreateMethod();

        // Remove devices that are auto discovered
        if(!libs._.includes(vm.supportedVendors, vendor) && createMethod.title !== 'Auto') {
          vm.supportedVendors.push(vendor);
          return;
        }
      });
    }

    function _pairDevice() {
      DSDevice
        .pair(vm.deviceClassId, vm.deviceDescriptorId, vm.deviceParams, vm.name)
        .then(function(pairingData) {
          vm.displayMessage = pairingData.displayMessage;
          vm.pairingTransactionId = pairingData.pairingTransactionId;

          $rootScope.$broadcast('wizard.next', 'addThing');
        })
        .catch(function(error) {
          $log.error(error);
        });
    }


    function back() {
      // Previous step
      $rootScope.$broadcast('wizard.prev', 'addThing');
    }

    function selectVendor(vendor) {
      vm.selectedVendor = vendor;

      // Remove deviceClasses that are auto discovered
      vm.supportedDeviceClasses = [];
      angular.forEach(vendor.deviceClasses, function(deviceClass) {
        var createMethod = deviceClass.getCreateMethod();

        if(createMethod.title !== 'Auto') {
          vm.supportedDeviceClasses.push(deviceClass);
        }
      });

      // Next step
      $rootScope.$broadcast('wizard.next', 'addThing');
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
          $rootScope.$broadcast('wizard.next', 'addThing');
        } else {
          $rootScope.$broadcast('wizard.goToStep', 'addThing', 4);
        }
      } else {
        $rootScope.$broadcast('wizard.next', 'addThing');
      }
    }

    function createThing(deviceDescriptorId, deviceParams) {
      vm.deviceDescriptorId = deviceDescriptorId;
      vm.deviceParams = deviceParams;

      $rootScope.$broadcast('wizard.next', 'addThing');
    }

    function setupThing() {
      vm.modalInstance.close();
    }

    function save() {
      // Without setupMethod the device can be saved directly
      if(vm.setupMethod) {
        _pairDevice();
      } else {
        DSDevice
          .add(vm.deviceClassId, vm.deviceDescriptorId, vm.deviceParams, vm.name)
          .then(function(data) {
            vm.modalInstance.close();
          })
          .catch(function(error) {
            $log.error(error);
          });
      }
    }

  }

}());
