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
 * @name guh.components.controller:AddEventCtrl
 *
 * @description
 * Add a new action to a rule.
 *
 */

(function() {
  'use strict';

  angular
    .module('guh.components')
    .controller('AddEventCtrl', AddEventCtrl);

  AddEventCtrl.$inject = ['$log', '$rootScope', 'DSDevice'];

  function AddEventCtrl($log, $rootScope, DSDevice) {

    var vm = this;

    vm.things = [];
    vm.currentThing = null;
    vm.currentEventType = null;

    vm.$onInit = $onInit;

    vm.selectThing = selectThing;
    vm.hasCurrentThing = hasCurrentThing;
    vm.selectEventType = selectEventType;


    function $onInit() {
      _setThings();
    }

    function _hasEvents(device) {
      return angular.isDefined(device.deviceClass) &&
             angular.isDefined(device.deviceClass.eventTypes) &&
             device.deviceClass.eventTypes.length > 0;
    }

    function _setThings() {
      var things = DSDevice.getAll();
      vm.things = things.filter(_hasEvents);
    }


    function selectThing(thing) {
      vm.currentThing = thing;
      $rootScope.$broadcast('wizard.next', 'addEvent');
    }

    function hasCurrentThing() {
      return vm.currentThing !== null;
    }

    function selectEventType(eventType) {
      var eventDescriptor = vm.currentThing.getEventDescriptor(eventType);
      vm.currentEventType = eventType;

      vm.modalInstance.close({
        thing: vm.currentThing,
        eventType: vm.currentEventType,
        eventDescriptor: eventDescriptor
      });
    }

  }

}());