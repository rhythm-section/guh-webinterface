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
 * @name guh.devices.controller:RemoveDeviceCtrl
 *
 * @description
 * Edit a certain device.
 *
 */

(function(){
  'use strict';

  angular
    .module('guh.devices')
    .controller('RemoveDeviceCtrl', RemoveDeviceCtrl);

  RemoveDeviceCtrl.$inject = ['$log', '$rootScope', '$scope', '$state', 'DSDevice', 'DSRule', 'ngDialog'];

  function RemoveDeviceCtrl($log, $rootScope, $scope, $state, DSDevice, DSRule, ngDialog) {

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
    vm.parentDevice = {};
    vm.childDevices = [];
    vm.rulePolicies = {};

    vm.removeAll = removeAll;
    vm.setPolicy = setPolicy;
    vm.getPolicyLabel = getPolicyLabel;


    function _init() {
      if(angular.isDefined($scope.ngDialogData)) {
        var error = $scope.ngDialogData.error;
        vm.device = $scope.ngDialogData.device;

        _checkError(error);
      }
    }

    function _checkError(error) {
      var errorCode = error.data ? (error.data.error ? error.data.error : (error.data.deviceError) ? error.data.deviceError : null) : null;

      $log.log('checkError', errorCode);

      if(errorCode) {
        switch(errorCode) {
          case 'DeviceErrorDeviceIsChild':
            _setDevices();
            break;
          case 'DeviceErrorDeviceInRule':
            var ruleIds = error.data.ruleIds ? error.data.ruleIds : [];
            _setRules(ruleIds);
            break;
          default:
            $log.error(error);
        }
      } else {
        $log.error(error);
      }
    }

    function _setDevices() {
      if(DSDevice.is(vm.device)) {
        // Parent
        vm.parentDevice = DSDevice.get(vm.device.parentId);

        // Children
        if(DSDevice.is(vm.parentDevice)) {
          vm.childDevices = DSDevice.getAll().filter(function(device) {
            return device.parentId === vm.parentDevice.id;
          });
        }
      }
    }

    function _setRules(ruleIds) {
      vm.rules = ruleIds.map(function(ruleId) {
        return DSRule.get(ruleId);
      });

      // Go to step 2
      $rootScope.$broadcast('wizard.next', 'removeDevice');
    }

    function _initPolicies() {
      angular.forEach(vm.rules, function(rule, index) {
        setPolicy(vm.policyAllowedValues.update.label, rule.id);
      });
    }


    function removeAll() {
      var params = {};
      params.removePolicyList = [];
      angular.forEach(vm.rulePolicies, function(policy, ruleId) {
        params.removePolicyList.push({
          policy: policy,
          ruleId: ruleId
        });
      });

      vm.parentDevice
        .remove(params)
        .then(function(response) {
          $log.log('Device successfully removed', response);

          ngDialog.closeAll();

          $state.go('guh.devices.master', { bypassCache: true }, {
            reload: true,
            inherit: false,
            notify: true
          });
        })
        .catch(function(error) {
          _checkError(error);
        })
        .finally(function() {
          _initPolicies();
        });
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
