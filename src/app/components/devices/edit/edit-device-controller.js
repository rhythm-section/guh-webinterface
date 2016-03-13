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
 * @name guh.devices.controller:DevicesEditCtrl
 *
 * @description
 * Edit a certain device.
 *
 */

(function(){
  'use strict';

  angular
    .module('guh.devices')
    .controller('EditDeviceCtrl', EditDeviceCtrl);

  EditDeviceCtrl.$inject = ['$log', '$scope', '$state', '$stateParams', 'DSDevice', 'DSRule', 'modalInstance', 'MorphModal'];

  function EditDeviceCtrl($log, $scope, $state, $stateParams, DSDevice, DSRule, modalInstance, MorphModal) {

    var vm = this;
    var currentDevice = {};
    var devices = [];

    // View variables
    vm.modalInstance = modalInstance;

    // View methods
    vm.remove = remove;


    function _init(bypassCache) {
      var deviceId = $stateParams.deviceId;

      _findDevice(bypassCache, deviceId)
        .then(function(device) {
          currentDevice = device;

          vm.name = device.name;
        })
        .catch(function(error) {
          $log.error('guh.controller.DevicesEditCtrl', error);
        });
    }

    function _findDevice(bypassCache, deviceId) {
      if(bypassCache) {
        return DSDevice.find(deviceId, { bypassCache: true });
      }
      
      return DSDevice.find(deviceId);
    }

    function _getErrorData(error) {
      var errorCode = error.data ? (error.data.error ? error.data.error : (error.data.deviceError) ? error.data.deviceError : null) : null;
      var errorData = {};

      if(errorCode) {
        switch(errorCode) {
          case 'DeviceErrorDeviceIsChild':
            devices = _getDevices();
            errorData.devices = devices;
            break;
          case 'DeviceErrorDeviceInRule':
            var ruleIds = error.data.ruleIds ? error.data.ruleIds : [];
            errorData.moods = _getMoods(ruleIds);
            break;
          default:
            $log.error(error);
        }
      } else {
        $log.error(error);
      }

      return errorData;
    }

    function _getDevices() {
      var deviceToDelete = currentDevice;
      var devices = {
        parentDevice: {},
        childDevices: []
      };

      if(DSDevice.is(deviceToDelete)) {
        while(angular.isDefined(deviceToDelete.parentId)) {
          // Parent
          var parentDevice = DSDevice.get(deviceToDelete.parentId);
          var childDevices = [];
          
          // Children
          if(DSDevice.is(parentDevice)) {
            var currentChildDevices = DSDevice.getAll().filter(function(device) {
              return device.parentId === parentDevice.id;
            });

            childDevices = childDevices.concat(currentChildDevices);
          }

          // Override deviceToDelete with it's parent to traverse up
          deviceToDelete = parentDevice;
        }

        devices.parentDevice = parentDevice;

        // Filter deviceToDelete from childDevices
        devices.childDevices = childDevices.filter(function(childDevice) {
          return childDevice.id === deviceToDelete.id;
        });
      }

      return devices;
    }

    function _getMoods(ruleIds) {
      return DSRule.getAll(ruleIds);
    }


    function remove() {
      currentDevice
        .remove()
        .then(function(data) {
          /* jshint unused:true */
          modalInstance.close();
        })
        .catch(function(error) {
          MorphModal
            .add({
              controller: 'RemoveDeviceCtrl',
              controllerAs: 'removeDevice',
              data: {
                currentDevice: currentDevice,
                errorData: _getErrorData(error)
              },
              templateUrl: 'app/components/devices/remove/remove-device-modal.html'
            })
            .then(function(modal) {
              modal.open();
            })
            .catch(function(error) {
              $log.error('error', error);
            });
        });
    }


    _init(true);

  }

}());
