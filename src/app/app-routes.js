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
    .module('guh')
    .config(config);

    config.$inject = ['$urlRouterProvider', '$stateProvider'];

    function config($urlRouterProvider, $stateProvider) {

      /*
       * URLs
       */

      $urlRouterProvider
        .otherwise('/devices');


      /*
       * States
       */

      $stateProvider.state('guh', {
        abstract: true,
        controller: 'AppCtrl',
        controllerAs: 'app',
        resolve: {
          initialData: function($q, DSVendor, DSDeviceClass, DSDevice, DSRule) {
            function _findAllVendors() {
              return DSVendor.findAll();
            }

            function _findAllDeviceClasses() {
              return DSDeviceClass.findAll();
            }

            function _findDeviceClassRelations(deviceClasses) {
              return angular.forEach(deviceClasses, function(deviceClass) {
                return DSDeviceClass.loadRelations(deviceClass, ['actionType', 'eventType', 'stateType']);
              });
            }

            function _findAllDevices() {
              return DSDevice.findAll();
            }

            // TODO: Find out why this isn't working (deviceClass relations are working because they are already loaded when deviceClasses are loaded)
            function _findDeviceRelations(devices) {
              return angular.forEach(devices, function(device) {
                return DSDevice.loadRelations(device, ['state']);
              });
            }

            function _findAllRules() {
              return DSRule.findAll();
            }

            return $q
              .all([
                _findAllVendors(),
                _findAllDeviceClasses()
                  .then(_findDeviceClassRelations),
                _findAllDevices()
                  .then(_findDeviceRelations),
                _findAllRules()
              ])
              .then(function(data) {
                var initialData = {};
                
                initialData.vendors = data[0];
                initialData.deviceClasses = data[1];
                initialData.devices = data[2];
                initialData.rules = data[3];

                return initialData;
              })
              .catch(function(error) {
                return error;
              });
          }
        },
        templateUrl: 'app/app.html'
      });

        $stateProvider.state('guh.devices', {
          abstract: true,
          template: '<ui-view class="page-transition hero-transition" />',
          url: '/devices'
        });

          $stateProvider.state('guh.devices.master', {
            controller: 'DevicesMasterCtrl',
            controllerAs: 'devices',
            url: '',
            templateUrl: 'app/components/devices/master/devices-master.html'
          });

          $stateProvider.state('guh.devices.detail', {
            controller: 'DevicesDetailCtrl',
            controllerAs: 'device',
            params: { deviceId: null },
            url: '/:deviceId',
            templateUrl: 'app/components/devices/detail/devices-detail.html'
          });

        $stateProvider.state('guh.services', {
          abstract: true,
          template: '<ui-view/>',
          url: '/services'
        });

          $stateProvider.state('guh.services.master', {
            controller: 'ServicesMasterCtrl',
            controllerAs: 'services',
            url: '',
            templateUrl: 'app/components/services/master/services-master.html'
          });

          $stateProvider.state('guh.services.detail', {
            controller: 'ServicesDetailCtrl',
            controllerAs: 'service',
            url: '/:serviceId',
            templateUrl: 'app/components/services/detail/services-detail.html'
          });

        $stateProvider.state('guh.moods', {
          abstract: true,
          template: '<ui-view/>',
          url: '/moods'
        });

          $stateProvider.state('guh.moods.master', {
            controller: 'MoodsMasterCtrl',
            controllerAs: 'moods',
            url: '',
            templateUrl: 'app/components/moods/master/moods-master.html'
          });

          $stateProvider.state('guh.moods.detail', {
            controller: 'MoodsDetailCtrl',
            controllerAs: 'mood',
            url: '/:moodId',
            templateUrl: 'app/components/moods/detail/moods-detail.html'
          });
      
    }

}());