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
    .controller('EditThingCtrl', EditThingCtrl);

  EditThingCtrl.$inject = ['$log', '$rootScope', 'DSDevice', 'ModalContainer'];

  /**
   * @ngdoc controller
   * @name guh.containers.controller:EditThingCtrl
   * @description Container component for editting a new thing.
   *
   */
  function EditThingCtrl($log, $rootScope, DSDevice, ModalContainer) {
    
    var vm = this;
    vm.isConfigureable = false;
    vm.name = '';
    vm.selectedDeviceClass = null;
    vm.createMethod = '';
    vm.setupMethod = '';
    vm.params = [];
    vm.discoveredDevices = [];
    vm.deviceDescriptorId = '';
    vm.deviceParams = [];

    vm.$onInit = $onInit;

    vm.editConfiguration = editConfiguration;
    vm.setName = setName;
    vm.save = save;


    function $onInit() {
      $log.log('guh.containers.controller:EditThingCtrl', vm);

      vm.name = vm.thing.name;
      vm.deviceClass = vm.thing.deviceClass;
      vm.createMethod = vm.thing.deviceClass.getCreateMethod();
      vm.setupMethod = vm.thing.deviceClass.getSetupMethod();
      vm.deviceClassId = vm.thing.deviceClass.id;

      if(angular.isDefined(vm.createMethod) && vm.createMethod.title !== 'Auto') {
        vm.isConfigureable = true;
      }

      $log.log('vm.createMethod', vm.createMethod);
      $log.log('vm.setupMethod', vm.setupMethod);
    }

    function $onChanges(changesObj) {
      $log.log('$onChanges', changesObj);

      if(angular.isDefined(changesObj) &&
         angular.isDefined(changesObj.name)) {

      }
    }


    function editConfiguration(deviceDescriptorId, deviceParams) {
      // vm.deviceDescriptorId = deviceDescriptorId;
      // vm.deviceParams = deviceParams;

      // $log.log(deviceDescriptorId, deviceParams);

      // $rootScope.$broadcast('wizard.next', 'editThing');

      ModalContainer
        .add({
          controller: ['modalInstance', function(modalInstance) {
            this.modalInstance = modalInstance;
            this.thing = vm.thing;
          }],
          controllerAs: 'modal',
          data: null,
          template: '<guh-reconfigure-thing thing="modal.thing" modal-instance="modal.modalInstance"></guh-reconfigure-thing>'
        })
        .then(function(modal) {
          modal.open();
        })
        .catch(function(error) {
          $log.error('error', error);
        });
    }

    function setName(name) {
      $log.log('setName', name);
      vm.name = name;
    }

    function save(isValid, name) {
      $log.log('save', isValid, name);

      // Without setupMethod the device can be saved directly
      // if(vm.setupMethod) {
      //   $log.log('Go to setup method step.');
      //   // _pairDevice();
      // } else {
        // DSDevice.reconfigure(vm.thing.id, vm.deviceDescriptorId, vm.deviceParams, vm.thing.name)
        //   .then(function() {
        //     vm.modalInstance.close();
            vm.thing.edit(name)
              .then(function(response) {
                vm.modalInstance.close();
              })
              .catch(function(error) {
                $log.error(error);
              });
          // })
          // .catch(function(error) {
          //   $log.error(error);
          // });
      // }
    }

  }

}());
