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
 * @name guh.devices.controller:DevicesEditCtrl
 *
 * @description
 * Edit a certain device.
 *
 */

// (function(){
//   'use strict';

//   angular
//     .module('guh.devices')
//     .controller('EditServiceCtrl', EditServiceCtrl);

//   EditServiceCtrl.$inject = ['$log', '$scope', '$state', '$stateParams', 'DSDevice', 'DSRule', 'modalInstance', 'MorphModal'];

//   function EditServiceCtrl($log, $scope, $state, $stateParams, DSDevice, DSRule, modalInstance, MorphModal) {

//     var vm = this;
//     var currentService = {};
//     var services = [];

//     // View variables
//     vm.modalInstance = modalInstance;

//     // View methods
//     vm.remove = remove;


//     function _init(bypassCache) {
//       var deviceId = $stateParams.serviceId;

//       _findDevice(bypassCache, deviceId)
//         .then(function(device) {
//           currentService = device;

//           vm.name = device.name;
//         })
//         .catch(function(error) {
//           $log.error('guh.controller.ServicesEditCtrl', error);
//         });
//     }

//     function _findDevice(bypassCache, deviceId) {
//       if(bypassCache) {
//         return DSDevice.find(deviceId, { bypassCache: true });
//       }
      
//       return DSDevice.find(deviceId);
//     }

//     function _getErrorData(error) {
//       var errorCode = error.data ? (error.data.error ? error.data.error : (error.data.deviceError) ? error.data.deviceError : null) : null;
//       var errorData = {};

//       if(errorCode) {
//         switch(errorCode) {
//           case 'DeviceErrorDeviceIsChild':
//             services = _getServices();
//             errorData.services = services;
//             break;
//           case 'DeviceErrorDeviceInRule':
//             var ruleIds = error.data.ruleIds ? error.data.ruleIds : [];
//             errorData.moods = _getMoods(ruleIds);
//             break;
//           default:
//             $log.error(error);
//         }
//       } else {
//         $log.error(error);
//       }

//       return errorData;
//     }

//     function _getServices() {
//       var serviceToDelete = currentService;
//       var services = {
//         parentService: {},
//         childServices: []
//       };

//       if(DSDevice.is(serviceToDelete)) {
//         var parentService;
//         var childServices;


//         while(angular.isDefined(serviceToDelete.parentId)) {
//           // Parent
//           parentService = DSDevice.get(serviceToDelete.parentId);
//           childServices = [];
          
//           // Children
//           if(DSDevice.is(parentService)) {
//             var currentChildServices = DSDevice.getAll().filter(function(service) {
//               return service.parentId === parentService.id;
//             });

//             childServices = childServices.concat(currentChildServices);
//           }

//           // Override serviceToDelete with it's parent to traverse up
//           serviceToDelete = parentService;
//         }

//         services.parentService = parentService;

//         // Filter serviceToDelete from childServices
//         services.childServices = childServices.filter(function(childService) {
//           return childService.id === serviceToDelete.id;
//         });
//       }

//       return services;
//     }

//     function _getMoods(ruleIds) {
//       return DSRule.getAll(ruleIds);
//     }

//     function remove() {
//       currentService
//         .remove()
//         .then(function() {
//           /* jshint unused:true */
//           modalInstance.close();
//         })
//         .catch(function(error) {
//           MorphModal
//             .add({
//               controller: 'RemoveServiceCtrl',
//               controllerAs: 'removeService',
//               data: {
//                 currentService: currentService,
//                 errorData: _getErrorData(error)
//               },
//               templateUrl: 'app/components/services/remove/remove-service-modal.html'
//             })
//             .then(function(modal) {
//               modal.open();
//             })
//             .catch(function(error) {
//               $log.error('error', error);
//             });
//         });
//     }


//     _init(true);

//   }

// }());
