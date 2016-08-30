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
    .controller('LoadCtrl', LoadCtrl);

    LoadCtrl.$inject = ['$log', '$q', 'app', 'DSPlugin', 'DSVendor', 'DSDeviceClass', 'DSDevice', 'DSRule'];


    function LoadCtrl($log, $q, app, DSPlugin, DSVendor, DSDeviceClass, DSDevice, DSRule) {

      var vm = this;

      vm.currentContent = {
        loading: false
      };

      // Methods
      vm.$onInit = $onInit;


      function $onInit() {
        $q.all([
            _loadPlugins(),
            _loadVendors(),
            _loadDeviceClasses()
              .then(_linkRelations),
            _loadDevices(),
            _loadRules()
          ])
          .then(function(data) {
            /* jshint unused:false */
            app.dataLoaded = true;

            vm.onDataLoaded();
          })
          .catch(function(error) {
            $log.error(error);
          });
      }


      function _loadPlugins() {
        return DSPlugin.load();
      }

      function _loadVendors() {
        return DSVendor.load();
      }

      function _loadDeviceClasses() {
        return DSDeviceClass.load();
      }

      function _linkRelations(deviceClasses) {
        return angular.forEach(deviceClasses, function(deviceClass) {
          deviceClass.actionTypesLinked = DSDeviceClass.getAllActionTypes(deviceClass.id);
          deviceClass.eventTypesLinked = DSDeviceClass.getAllEventTypes(deviceClass.id);
          deviceClass.stateTypesLinked = DSDeviceClass.getAllStateTypes(deviceClass.id);
        });
      }

      function _loadDevices() {
        return DSDevice.load();
      }

      function _loadRules() {
        return DSRule.load();
      }

    };

}());
