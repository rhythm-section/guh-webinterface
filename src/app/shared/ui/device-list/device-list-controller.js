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
    .module('guh.ui')
    .controller('DeviceListCtrl', DeviceListCtrl);

  DeviceListCtrl.$inject = ['libs', '$log', '$state', 'DSDevice'];

  /**
   * @ngdoc controller
   * @name guh.ui.controller:DeviceListCtrl
   * @description Container component for a list of devices.
   *
   */
  function DeviceListCtrl(libs, $log, $state, DSDevice) {
    var vm = this;


    vm.devices = [];
    vm.filterItems = [];


    vm.$onInit = onInit;
    vm.filter = filter;;


    /**
     * @ngdoc method
     * @methodOf guh.ui.controller:DeviceListCtrl
     * @name _getTags
     * @description Get basicTags of a device
     * @param {Object} device Device instance
     * @returns {Array} Array of Strings. Each String represents a tag. Returns empty Array if deviceClass of device has no property called basicTags.
     *
     */
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


    /**
     * @ngdoc method
     * @methodOf guh.ui.controller:DeviceListCtrl
     * @name onInit
     * @description Initialize the controller...
     *
     */
    function onInit() {
      var tags = [];

      // $log.log('DeviceListCtrl:onInit()', vm);

      vm.devices = DSDevice.getAll();

      if(angular.isArray(vm.devices) && vm.devices.length === 0) {
        $state.go('guh.intro', {
          previousState: {
            name: $state.current.name,
            params: {}
          }
        });
      }

      tags = libs._.uniq([].concat.apply([], vm.devices.map(_getTags)));
      vm.filterItems = tags.map(_getFilterItem);
    }

    function filter(filterItems) {
      vm.filterItems = filterItems;
    }


    /**
     * @ngdoc method
     * @methodOf guh.ui.controller:DeviceListCtrl
     * @name afterDeviceAdded
     * @description Initialize the controller...
     *
     */
    function afterDeviceAdded(resource, state) {
      $log.log('afterDeviceAdded(resource, state)', resource, state);
      
    }
    DSDevice.on('DS.afterInject', afterDeviceAdded);

    /**
     * @ngdoc method
     * @methodOf guh.ui.controller:DeviceListCtrl
     * @name afterDeviceRemoved
     * @description Initialize the controller...
     *
     */
    function afterDeviceRemoved(resource, device) {
      $log.log('afterDeviceRemoved(resource, state)', resource, device);
    }
    DSDevice.on('DS.afterEject', afterDeviceRemoved);
  }

}());
