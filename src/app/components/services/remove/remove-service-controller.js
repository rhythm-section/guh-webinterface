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

  RemoveServiceCtrl.$inject = ['$log', '$rootScope', '$scope', '$timeout', '$state', 'DSDevice', 'DSRule', 'modalInstance'];

  function RemoveServiceCtrl($log, $rootScope, $scope, $timeout, $state, DSDevice, DSRule, modalInstance) {

    var vm = this;
    vm.modalInstance = modalInstance;

    vm.policyAllowedValues = {
      update: {
        label: 'Update mood',
        value: 'RemovePolicyUpdate'
      },
      remove: {
        label: 'Remove mood',
        value: 'RemovePolicyCascade'
      }
    };
    vm.currentService = {};
    vm.parentService = null;
    vm.childServices = [];
    vm.moods = [];
    vm.rulePolicies = {};
    vm.servicePoliciesSet = false;

    vm.removeAll = removeAll;
    vm.setPolicy = setPolicy;
    vm.getPolicyLabel = getPolicyLabel;


    function _init() {
      if(angular.isDefined(modalInstance.data)) {
        var errorData = angular.isDefined(modalInstance.data.errorData) ? modalInstance.data.errorData : null;

        vm.currentService = angular.isDefined(modalInstance.data.currentService) ? modalInstance.data.currentService : null;

        // Check if associated services are available
        if(angular.isDefined(errorData.services)) {
          vm.parentService = errorData.services.parentService;
          vm.childServices = errorData.services.childServices;
        }

        if(angular.isDefined(errorData.moods)) {
          if((!vm.parentService)) {
            vm.servicePoliciesSet = true;
          }

          vm.moods = errorData.moods;
        }
      }
    }

    function _checkError(error) {
      var errorCode = error.data ? (error.data.error ? error.data.error : (error.data.deviceError) ? error.data.deviceError : null) : null;

      if(errorCode) {
        switch(errorCode) {
          case 'DeviceErrorDeviceInRule':
            var ruleIds = error.data.ruleIds ? error.data.ruleIds : [];
            _setMoods(ruleIds);
            _initPolicies();
            break;
          default:
            $log.error(error);
        }
      } else {
        $log.error(error);
      }
    }

    function _setMoods(ruleIds) {
      vm.moods = DSRule.getAll(ruleIds);
      vm.servicePoliciesSet = true;
    }

    function _initPolicies() {
      angular.forEach(vm.rules, function(rule, index) {
        setPolicy(vm.policyAllowedValues.update.label, rule.id);
      });
    }


    function removeAll() {
      var serviceToDelete = DSDevice.is(vm.parentService) ? vm.parentService : vm.currentService;
      var params = {};

      if(vm.parentService || (!vm.parentService && vm.moods.length > 0)) {
        vm.servicePoliciesSet = true;
      }

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
            modalInstance.closeAll();

            // Update services and moods
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
