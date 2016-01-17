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

  EditDeviceCtrl.$inject = ['$log', '$scope', '$state', '$stateParams', 'DSDevice', 'modalInstance'];

  function EditDeviceCtrl($log, $scope, $state, $stateParams, DSDevice, modalInstance) {

    var vm = this;
    var currentDevice = {};
    vm.modalInstance = modalInstance;

    // Public methods
    vm.remove = remove;


    function _init(bypassCache) {
      var deviceId = $stateParams.deviceId;

      _findDevice(bypassCache, deviceId)
        .then(function(device) {
          $log.log('deviceId', deviceId);
          $log.log('currentDevice', currentDevice);
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

    function remove() {
      currentDevice
        .remove()
        .then(function(response) {
          $state.go('guh.devices.master', {}, {
            reload: true,
            inherit: false,
            notify: true
          });
          
          modalInstance.close();
        })
        .catch(function(error) {
          $log.error(error);
        });
    }


    _init(true);

  }

}());
