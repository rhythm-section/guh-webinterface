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

  EditThingCtrl.$inject = ['$log', 'DSDevice'];

  /**
   * @ngdoc controller
   * @name guh.containers.controller:EditThingCtrl
   * @description Container component for editting a new thing.
   *
   */
  function EditThingCtrl($log, DSDevice) {
    
    var vm = this;
    vm.name;

    vm.$onInit = $onInit;

    vm.setName = setName;
    vm.save = save;


    function $onInit() {
      $log.log('guh.containers.controller:EditThingCtrl', vm);

      vm.name = vm.thing.name;
    }

    function $onChanges(changesObj) {
      $log.log('$onChanges', changesObj);

      if(angular.isDefined(changesObj) &&
         angular.isDefined(changesObj.name)) {

      }
    }


    function setName(name) {
      vm.name = name;
    }

    function save(isValid, name) {
      $log.log('Save changes', isValid, name);
      vm.thing.edit(vm.thing.id, name)
        .then(function(response) {
          vm.modalInstance.close();
        })
        .catch(function(error) {
          console.error(error);
        });
    }

  }

}());
