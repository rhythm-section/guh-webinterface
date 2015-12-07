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
 * @name guh.services.controller:RemoveServiceCtrl
 *
 * @description
 * Edit a certain device.
 *
 */

(function(){
  'use strict';

  angular
    .module('guh.services')
    .controller('RemoveServiceCtrl', RemoveServiceCtrl);

  RemoveServiceCtrl.$inject = ['$log', '$rootScope', '$scope', '$timeout', '$state', 'DSDevice', 'DSRule', 'ngDialog'];

  function RemoveServiceCtrl($log, $rootScope, $scope, $timeout, $state, DSDevice, DSRule, ngDialog) {

    var vm = this;
    vm.policyAllowedValues = {
      update: {
        label: 'Update rule',
        value: 'RemovePolicyUpdate'
      },
      remove: {
        label: 'Remove rule',
        value: 'RemovePolicyCascade'
      }
    };
    vm.parentService = {};
    vm.childServices = [];
    vm.rulePolicies = {};

    vm.removeAll = removeAll;
    vm.setPolicy = setPolicy;
    vm.getPolicyLabel = getPolicyLabel;

t
    function _init() {
      if(angular.isDefined($scope.ngDialogData)) {
        var error = $scope.ngDialogData.error;
        vm.service = $scope.ngDialogData.service;

        _checkError(error);
      }
    }

    function _checkError(error) {
      var errorCode = error.data ? (error.data.error ? error.data.error : (error.data.deviceError) ? error.data.deviceError : null) : null;

      if(errorCode) {
        switch(errorCode) {
          case 'DeviceErrorDeviceIsChild':
            _setServices();
            break;
          case 'DeviceErrorDeviceInRule':
            var ruleIds = error.data.ruleIds ? error.data.ruleIds : [];
            _setRules(ruleIds);
            _initPolicies();
            break;
          default:
            $log.error(error);
        }
      } else {
        $log.error(error);
      }
    }

    function _setServices() {
      if(DSDevice.is(vm.service)) {
        var currentService = vm.service;

        while(angular.isDefined(currentService.parentId)) {
          // Parent
          vm.parentService = DSDevice.get(currentService.parentId);
          
          // Children
          if(DSDevice.is(vm.parentService)) {
            var childServices = DSDevice.getAll().filter(function(service) {
              return service.parentId === vm.parentService.id;
            });

            vm.childServices.push(childServices);
          }

          currentService = vm.parentService;
        }
      }
    }

    function _setRules(ruleIds) {
      vm.rules = ruleIds.map(function(ruleId) {
        return DSRule.get(ruleId);
      });

      // Go to step 2
      $timeout(function() {
        $rootScope.$broadcast('wizard.next', 'removeService');
      }, 200);
    }

    function _initPolicies() {
      angular.forEach(vm.rules, function(rule, index) {
        setPolicy(vm.policyAllowedValues.update.label, rule.id);
      });
    }


    function removeAll() {
      var serviceToDelete = DSDevice.is(vm.parentService) ? vm.parentService : vm.service;
      var params = {};

      params.removePolicyList = [];
      angular.forEach(vm.rulePolicies, function(policy, ruleId) {
        params.removePolicyList.push({
          policy: policy,
          ruleId: ruleId
        });
      });

      if(DSDevice.is(serviceToDelete)) {
        serviceToDelete
          .remove(params)
          .then(function(response) {
            ngDialog.closeAll();

            $state.go('guh.services.master', { bypassCache: true }, {
              reload: true,
              inherit: false,
              notify: true
            });
          })
          .catch(function(error) {
            _checkError(error);
          });
      }
    }

    function setPolicy(policyLabel, ruleId) {
      var policy = (policyLabel === vm.policyAllowedValues.remove.label) ? vm.policyAllowedValues.remove.value : vm.policyAllowedValues.update.value;
      vm.rulePolicies[ruleId] = policy;
    }

    function getPolicyLabel(policyValue) {
      var policyLabel;

      angular.forEach(vm.policyAllowedValues, function(policyAllowedValue) {
        if(policyAllowedValue.value === policyValue) {
          policyLabel = policyAllowedValue.label;
        }
      });

      return policyLabel;
    }


    _init();

  }

}());
