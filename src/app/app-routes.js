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
          template: '<guh-intro host="{{ host }}"></guh-intro>',
          url: '/intro',
          resolve: {
            host: ['host', function(host) {
              return host;
            }]
          },
          params: {
            previousState: {}
          },
          controller: ['$scope', 'host', function($scope, host) {
            $scope.host = host;
          }]
        });

        $stateProvider.state('guh.dashboard', {
          template: '<guh-dashboard></guh-dashboard>',
          url: '/dashboard'
        });

        $stateProvider.state('guh.things', {
          template: '<guh-things></guh-things>',
          url: '/things'
        });

        $stateProvider.state('guh.thingDetails', {
          template: '<guh-thing-details></guh-thing-details>',
          url: '/things/:deviceId',
          params: {
            deviceId: null
          }
        });

        $stateProvider.state('guh.rules', {
          template: '<guh-rules></guh-rules>',
          url: '/rules'
        });

        $stateProvider.state('guh.ruleDetails', {
          template: '<guh-rule-details></guh-rule-details>',
          url: '/rules/:ruleId',
          params: {
            ruleId: null
          }
        });

        $stateProvider.state('guh.settings', {
          template: '<guh-settings></guh-settings>',
          url: '/settings'
        });
      
    }

}());