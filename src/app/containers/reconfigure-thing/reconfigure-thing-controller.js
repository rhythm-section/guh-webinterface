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
    .module('guh.containers')
    .controller('ReconfigureThingCtrl', ReconfigureThingCtrl);

  ReconfigureThingCtrl.$inject = ['$log', 'DSDevice'];

  /**
   * @ngdoc controller
   * @name guh.containers.controller:ReconfigureThingCtrl
   * @description Container component for editting a new thing.
   *
   */
  function ReconfigureThingCtrl($log, DSDevice) {
    
    var vm = this;

    vm.$onInit = $onInit;

    vm.saveConfiguration = saveConfiguration;


    function $onInit() {
      $log.log('guh.containers.controller:ReconfigureThingCtrl', vm);

      vm.name = vm.thing.name;
      vm.deviceClass = vm.thing.deviceClass;
      vm.createMethod = vm.thing.deviceClass.getCreateMethod();
      vm.setupMethod = vm.thing.deviceClass.getSetupMethod();
      vm.deviceClassId = vm.thing.deviceClass.id;

      $log.log('vm.createMethod', vm.createMethod);
      $log.log('vm.setupMethod', vm.setupMethod);
    }


    function saveConfiguration(deviceDescriptorId, deviceParams) {
      DSDevice.reconfigure(vm.thing.id, deviceDescriptorId, deviceParams, vm.thing.name)
        .then(function() {
          vm.modalInstance.close();
        })
        .catch(function(error) {
          $log.error(error);
        });
    }

  }

}());
