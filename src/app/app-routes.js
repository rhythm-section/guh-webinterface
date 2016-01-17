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

    config.$inject = ['$provide', '$urlRouterProvider', '$stateProvider', 'guhLoggingProvider'];

    function config($provide, $urlRouterProvider, $stateProvider, guhLoggingProvider) {

      /*
       * Logging
       */

      guhLoggingProvider.enhance('error');
      guhLoggingProvider.after('error', 'broadcast');


      /*
       * URLs
       */

      $urlRouterProvider
        .otherwise('/intro');


      /*
       * States
       */

      $stateProvider.state('guh', {
        abstract: true,
        controller: 'AppCtrl',
        controllerAs: 'app',
        resolve: {
          host: ['$location', 'app', 'DSSettings', function($location, app, DSSettings) {
            return DSSettings
              .find('admin')
              .then(function(data) {
                return data.host;
              })
              .catch(function(error) {
                /* jshint unused:false */
                return $location.host();
              });
          }]
        },
        templateUrl: 'app/app.html'
      });

        $stateProvider.state('guh.intro', {
          controller: 'IntroCtrl',
          controllerAs: 'intro',
          params: {
            previousState: {}
          },
          url: '/intro',
          templateUrl: 'app/components/intro/intro.html'
        });

        $stateProvider.state('guh.devices', {
          abstract: true,
          template: '<ui-view />',
          url: '/devices'
        });

          $stateProvider.state('guh.devices.master', {
            controller: 'DevicesMasterCtrl',
            controllerAs: 'devices',
            url: '',
            templateUrl: 'app/components/devices/master/devices-master.html'
          });

            $stateProvider.state('guh.devices.master.current', {
              controller: 'DevicesDetailCtrl',
              controllerAs: 'device',
              params: { deviceId: null },
              url: '/:deviceId',
              templateUrl: 'app/components/devices/detail/devices-detail.html'
            });

          // $stateProvider.state('guh.devices.detail', {
          //   controller: 'DevicesDetailCtrl',
          //   controllerAs: 'device',
          //   params: { deviceId: null },
          //   url: '/:deviceId',
          //   templateUrl: 'app/components/devices/detail/devices-detail.html'
          // });

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

            $stateProvider.state('guh.services.master.current', {
              controller: 'ServicesDetailCtrl',
              controllerAs: 'service',
              params: { serviceId: null },
              url: '/:serviceId',
              templateUrl: 'app/components/services/detail/services-detail.html'
            });

          // $stateProvider.state('guh.services.detail', {
          //   controller: 'ServicesDetailCtrl',
          //   controllerAs: 'service',
          //   url: '/:serviceId',
          //   templateUrl: 'app/components/services/detail/services-detail.html'
          // });

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

            $stateProvider.state('guh.moods.master.current', {
              controller: 'MoodsDetailCtrl',
              controllerAs: 'mood',
              params: { moodId: null },
              url: '/:moodId',
              templateUrl: 'app/components/moods/detail/moods-detail.html'
            });

          // $stateProvider.state('guh.moods.detail', {
          //   controller: 'MoodsDetailCtrl',
          //   controllerAs: 'mood',
          //   url: '/:moodId',
          //   templateUrl: 'app/components/moods/detail/moods-detail.html'
          // });
      
    }

}());