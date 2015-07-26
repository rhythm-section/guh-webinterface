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
 * @name guh.services.controller:ServicesMasterCtrl
 *
 * @description
 * Load and list configured services.
 *
 */

(function(){
  'use strict';

  angular
    .module('guh.services')
    .controller('ServicesMasterCtrl', ServicesMasterCtrl);

  ServicesMasterCtrl.$inject = ['$log', 'DSVendor', 'DSDeviceClass', 'DSDevice'];

  function ServicesMasterCtrl($log, DSVendor, DSDeviceClass, DSDevice) {

    // Don't show debugging information
    DSVendor.debug = false;
    DSDeviceClass.debug = false;
    DSDevice.debug = false;

    var vm = this;
    vm.configured = [];


    /**
     * @ngdoc interface
     * @name _loadViewData
     * @methodOf guh.services.controller:ServicesMasterCtrl
     *
     * @description
     * Set data for view.
     * 
     * @param {boolean} bypassCache True if services should be requested from Server instead of application memory (datastore)
     *
     */

    function _loadViewData(bypassCache) {
      _findAllDevices(bypassCache)
        .then(_findDeviceRelations)
        .then(function(services) {
          services.forEach(function(service) {
            service.name = (service.name === 'Name') ? service.deviceClass.name : service.name;

            if(service.deviceClass.classType === 'service' || service.deviceClass.classType === 'dev-service') {
              vm.configured.push(service);
            } else {
              $log.log('device removed', service);
            }
          });
        });
    }


    /**
     * @ngdoc interface
     * @name _findAllDevices
     * @methodOf guh.services.controller:ServicesMasterCtrl
     *
     * @description
     * Load configured services with there relations (deviceClass, vendor).
     * 
     * @param {boolean} bypassCache True if services should be requested from Server instead of application memory (datastore)
     * @returns {Array} Promise of DSDevice Objects enhanced with relational data (deviceClass, vendor)
     *
     */

    function _findAllDevices(bypassCache) {
      if(bypassCache) {
        return DSDevice.findAll({}, { bypassCache: true });
      }
      
      return DSDevice.findAll();
    }


    /**
     * @ngdoc interface
     * @name _findDeviceRelations
     * @methodOf guh.services.controller:ServicesMasterCtrl
     *
     * @description
     * Load device relation (deviceClass) for each of configured services.
     * 
     * @param {DSDevice} services List of services.
     * @returns {Array} Promise of DSDevice Objects enhanced with relational data (deviceClass)
     *
     */

    function _findDeviceRelations(services) {
      return angular.forEach(services, function(service) {
        return DSDevice
          .loadRelations(service, ['deviceClass'])
          .then(_findDeviceClassRelations);
      });
    }


    /**
     * @ngdoc interface
     * @name _findDeviceClassRelations
     * @methodOf guh.services.controller:ServicesMasterCtrl
     *
     * @description
     * Load deviceClass relation (vendor) for configured services.
     * 
     * @param {DSDevice} service Service object with related deviceClass
     * @returns {Object} Promise of DSDeviceClass Object enhanced with relational data (vendor)
     *
     */

    function _findDeviceClassRelations(service) {
      return DSDeviceClass.loadRelations(service.deviceClass, ['vendor']);
    }

    
    // Initialize controller
    _loadViewData();

  }

}());
