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
    .controller('RemoveThingCtrl', RemoveThingCtrl);

  RemoveThingCtrl.$inject = ['$log', '$rootScope', '$scope', '$timeout', '$state', 'DSDevice', 'DSRule'];

  /**
   * @ngdoc controller
   * @name guh.containers.controller:RemoveThingCtrl
   * @description Container component for adding a new thing.
   *
   */
  function RemoveThingCtrl($log, $rootScope, $scope, $timeout, $state, DSDevice, DSRule) {
    
    var vm = this;

    vm.$onInit = $onInit;

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
    vm.parentDevice = null;
    vm.childDevices = [];
    vm.rules = [];
    vm.rulePolicies = {};
    vm.devicePoliciesSet = false;

    vm.removeAll = removeAll;
    vm.setPolicy = setPolicy;
    vm.getPolicyLabel = getPolicyLabel;


    function $onInit() {
      // $log.log('guh.containers.controller:RemoveThingCtrl', vm);

      if(angular.isDefined(vm.thing && vm.errorData)) {
        // Check if associated devices are available
        if(angular.isDefined(vm.errorData.devices)) {
          vm.parentDevice = vm.errorData.devices.parentDevice;
          vm.childDevices = vm.errorData.devices.childDevices;
        }

        // Check if associated rules are available
        if(angular.isDefined(vm.errorData.rules)) {
          if((!vm.parentDevice)) {
            vm.devicePoliciesSet = true;
          }

          vm.rules = vm.errorData.rules;
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
      vm.rules = DSRule.getAll(ruleIds);
      vm.devicePoliciesSet = true;
    }    

    function _initPolicies() {
      angular.forEach(vm.rules, function(rule) {
        setPolicy(vm.policyAllowedValues.update.label, rule.id);
      });
    }


    function removeAll() {
      var deviceToDelete = DSDevice.is(vm.parentDevice) ? vm.parentDevice : vm.thing;
      var params = {};

      if(vm.parentDevice || (!vm.parentDevice && vm.rules.length > 0)) {
        vm.devicePoliciesSet = true;
      }

      params.removePolicyList = [];
      angular.forEach(vm.rulePolicies, function(policy, ruleId) {
        params.removePolicyList.push({
          policy: policy,
          ruleId: ruleId
        });
      });

      if(DSDevice.is(deviceToDelete)) {
        deviceToDelete
          .remove(params)
          .then(function(response) {
            vm.modalInstance.closeAll();

            $state.go('guh.things', { bypassCache: true }, {
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
        } else if(angular.isUndefined(policyValue)) {
          policyLabel = vm.policyAllowedValues.update.label;
        }
      });

      return policyLabel;
    }

  }

}());
