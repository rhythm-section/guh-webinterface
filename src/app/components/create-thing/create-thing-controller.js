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
    .module('guh.components')
    .controller('CreateThingCtrl', CreateThingCtrl);

  CreateThingCtrl.$inject = ['$log', '$rootScope', '$timeout'];

  /**
   * @ngdoc controller
   * @name guh.containers.controller:CreateThingCtrl
   * @description Presentational component to create a new thing.
   *
   */
  function CreateThingCtrl($log, $rootScope, $timeout) {
    
    var vm = this;

    var discoverTimer;
    var discoverTimerDuration = 1000;

    vm.discover = false;
    vm.loading = false;
    vm.discoverStatus = {
      pending: false,
      failure: false,
      success: false
    };
    vm.params = [];
    vm.discoveredDevices = [];
    vm.deviceDescriptorId = '';

    vm.$onInit = $onInit;
    vm.$onChanges = $onChanges;
    vm.discoverDevices = discoverDevices;
    vm.create = create;


    function $onInit() {}

    function $onChanges(changesObj) {
      // If deviceClass has changed, reset view data
      if(angular.isDefined(changesObj.deviceClass)) {
        vm.discover = false;
        vm.loading = false;
        vm.discoverStatus = {
          pending: false,
          failure: false,
          success: false
        };
        vm.params = [];
        vm.discoveredDevices = [];
        vm.deviceDescriptorId = '';
      }
    }


    function discoverDevices(params) {
      // Reset
      vm.params = [];
      
      vm.discover = false;
      vm.loading = true;
      vm.discoverStatus = {
        pending: true,
        failure: false,
        success: false
      };
      vm.params = angular.copy(params);

      if(discoverTimer) {
        $timeout.cancel(discoverTimer);
        discoverTimer = null;
      }

      vm.deviceClass
        .discover(params)
        .then(function(data) {
          vm.discover = true;
          vm.loading = false;

          vm.discoverStatus = {
            pending: false,
            failure: false,
            success: true
          };

          discoverTimer = $timeout(function() {
            vm.discoverStatus = {
              pending: false,
              success: false,
              failure: false
            };
            discoverTimer = null;
          }, discoverTimerDuration);

          vm.discoveredDevices = data.deviceDescriptors;
        })
        .catch(function(error) {
          vm.discover = true;
          vm.loading = false;

          vm.discoverStatus = {
            pending: false,
            failure: true,
            success: false
          };

          discoverTimer = $timeout(function() {
            vm.discoverStatus = {
              pending: false,
              success: false,
              failure: false
            };
            discoverTimer = null;
          }, discoverTimerDuration);

          $log.error(error);
        });
    }

    function create(deviceData) {
      vm.onCreateThing({
        deviceDescriptorId: (angular.isDefined(deviceData) && angular.isString(deviceData.id)) ? deviceData.id : '',
        deviceParams: (vm.deviceDescriptorId === '' && angular.isDefined(deviceData) && angular.isArray(deviceData)) ? deviceData : []
      });
    }

  }

}());
