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

  ServicesMasterCtrl.$inject = ['$log', '$state', 'DSDevice'];

  function ServicesMasterCtrl($log, $state, DSDevice) {

    // Don't show debugging information
    DSDevice.debug = false;

    var vm = this;
    vm.configured = [];


    /**
     * @ngdoc interface
     * @name _init
     * @methodOf guh.services.controller:ServicesMasterCtrl
     *
     * @description
     * Set data for view.
     * 
     * @param {boolean} bypassCache True if services should be requested from Server instead of application memory (datastore)
     *
     */

    function _init() {
      var services = DSDevice.getAll();

      if(angular.isArray(services) && services.length === 0 ) {
        $state.go('guh.intro');
      }

      services.forEach(function(service) {
        service.name = (service.name === 'Name') ? service.deviceClass.name : service.name;

        if(service.deviceClass.classType === 'service' || service.deviceClass.classType === 'dev-service') {
          vm.configured.push(service);
        }
      });
    }

    
    // Initialize controller
    _init();

  }

}());
