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
    .module('guh.ui')
    .directive('guhFormField', guhFormField);

    guhFormField.$inject = ['$log', '$http', '$templateCache', '$compile', 'libs', 'app'];

    function guhFormField($log, $http, $templateCache, $compile, libs, app) {
      var directive = {
        bindToController: {
          changeCallback: '&onValueChange',
          label: '@',
          name: '@',
          paramType: '=',
          required: '@',
          state: '=',
          template: '@',
          selectedOperator: '=',
          stateType: '=',
          valueOperator: '='
        },
        controller: formFieldCtrl,
        controllerAs: 'formField',
        link: formFieldLink,
        require: '?^^guhForm',
        restrict: 'E',
        scope: {}
      };

      return directive;


      function formFieldCtrl($scope, $attrs) {
        
        /*
         * Variables
         */

        /* jshint validthis: true */
        var vm = this;
        var throttleCallback = null;
        var debounceCallback = null;


        /*
         * API
         */

        // Variables
        vm.availableValueOperators = [];
        vm.selectedValueOperator = app.valueOperator.is;
        vm.is = null;
        vm.from = null;
        vm.to = null;

        // Methods
        vm.init = init;
        vm.setValue = setValue;
        vm.selectValueOperator = selectValueOperator;


        /*
         * Private methods
         */

        function init() {
          _setDefaults();
          _setValueOperators();

          if(vm.valueOperator) {
            vm.is = app.valueOperator.is;
            vm.is.paramType = angular.copy(vm.paramType);
            vm.is.stateType = angular.copy(vm.stateType);

            if(vm.selectedValueOperator) {
              // Reset
              if(angular.toJson(vm.selectedValueOperator) !== angular.toJson(app.valueOperator.is)) {
                vm.selectedValueOperator = app.valueOperator.is;
              }

              vm.selectedOperator = vm.selectedValueOperator.operators[0];
              vm.selectValueOperator();
            }
          }
        }

        function _getDefault(type) {
          var value;

          switch(type) {
            case 'checkbox':
            case 'toggle-button':
              value = false;
              break;
            case 'color':
              value = 'hsv(0, 0, 0)';
              break;
            case 'ipV4':
              value = '0.0.0.0';
              break;
            case 'ipV6':
              value = '0000.0000.0000.0000.0000.0000.0000.0000.0000';
              break;
            case 'mac':
              value = '00:00:00:00:00:00';
              break;
            case 'mail':
            case 'text':
            case 'textarea':
              value = '';
              break;
            case 'number-decimal':
              value = 0.0;
              break;
            case 'number-integer':
            case 'range':
              value = 0;
              break;
            case 'select':
              break;
            case 'not-available':
              value = null;
              break;
            default:
              value = null;
              break;
          }

          return value;
        }

        function _setDefaults() {
          // Value
          if(angular.isDefined(vm.state) && vm.state !== null) {
            if(angular.isDefined(vm.state.value) && vm.state.value !== null) {
              vm.value = vm.state.value;
            } else if(angular.isDefined(vm.state.defaultValue) && vm.state.defaultValue !== null) {
              vm.value = vm.state.defaultValue;
            } else {
              vm.value = _getDefault(vm.state.type);
            }
          } else if(angular.isDefined(vm.template) && vm.template !== '') {
            var filename = vm.template.substring(vm.template.lastIndexOf('/') + 1, vm.template.lastIndexOf('.'));
            var type = filename.replace('form-field-', '');

            vm.value = _getDefault(type);
          }

          // ParamType
          if(angular.isDefined(vm.paramType)) {
            // Min & max value
            vm.minValue = vm.paramType.minValue ? vm.paramType.minValue : 0;
            vm.maxValue = vm.paramType.maxValue ? vm.paramType.maxValue : 100;

            // Unit
            vm.unit = vm.paramType.unit ? app.unit[vm.paramType.unit] : undefined;
          }
        }

        function _setValueOperators() {
          var type = '';

          if(angular.isDefined(vm.paramType)) {
            type = vm.paramType.type;
          } else if(angular.isDefined(vm.stateType)) {
            type = vm.stateType.type;
          }

          switch(type) {
            case 'bool':
              vm.availableValueOperators = [
                app.valueOperator.is
              ];
              break;
            case 'QString':
              vm.availableValueOperators = [
                app.valueOperator.is
              ];
              break;
            case 'int':
            case 'uint':
            case 'double':
              vm.availableValueOperators = [
                app.valueOperator.is,
                app.valueOperator.isNot,
                app.valueOperator.isGreaterThan,
                app.valueOperator.isLessThan,
                app.valueOperator.between
              ];
              break;
          }
        }

        function _invokeCallback() {
          // TODO: Validate if no parent form => not necessary?

          // if(vm.value === null) {
          //   $log.log('value is NULL');
          //   vm.changeCallback({
          //     params: []
          //   });
          // } else if($attrs.onValueChange) {
          //   $log.log('$attrs.onValueChange', $attrs.onValueChange);
          //   vm.changeCallback({
          //     params: [{
          //       name: vm.name,
          //       value: vm.value
          //     }]
          //   });
          // }

          // Invoke callback function only if defined (if not defined, params can be passed to callback inside guh-form)
          if($attrs.onValueChange) {
            if(vm.value === null) {
              vm.changeCallback({
                params: []
              });
            } else {
              vm.changeCallback({
                params: [{
                  name: vm.name,
                  value: vm.value
                }]
              });
            }
          }
        }


        /*
         * Public methods
         */

        function selectValueOperator() {
          // Remove all accurances of this scope in formCtrl
          if(vm.formCtrl) {
            vm.formCtrl.removeFormField($scope);
          }

          // Reset
          vm.is = null;
          vm.from = null;
          vm.to = null;

          if(angular.toJson(vm.selectedValueOperator) === angular.toJson(app.valueOperator.between)) {
            vm.is = null;

            vm.from = angular.copy(vm.selectedValueOperator);
            vm.from.paramType = angular.copy(vm.paramType);
            vm.from.stateType = angular.copy(vm.stateType);
            vm.from.operator = angular.copy(vm.selectedValueOperator.operators[0]);

            vm.to = angular.copy(vm.selectedValueOperator);
            vm.to.paramType = angular.copy(vm.paramType);
            vm.to.stateType = angular.copy(vm.stateType);
            vm.to.operator = angular.copy(vm.selectedValueOperator.operators[1]);
          } else {
            vm.is = angular.copy(vm.selectedValueOperator);
            vm.is.paramType = angular.copy(vm.paramType);
            vm.is.stateType = angular.copy(vm.stateType);
            vm.is.operator = angular.copy(vm.selectedValueOperator.operators[0]);

            vm.from = null;
            vm.to = null;
          }
        }

        function setValue(type, wait, options) {
          var invokeWait;
          var invokeOptions;

          if(typeof wait !== 'undefined') {
            invokeWait = wait || 0;
          }

          if(typeof options !== 'undefined') {
            invokeOptions = {
              leading: options.leading || false,
              trailing: options.trailing || true
            };

            if(typeof type !== 'undefined' && type === 'throttle') {
              invokeOptions.maxWait = options.maxWait || invokeWait;
            }
          } else {
            invokeOptions = {
              leading: false,
              trailing: true
            };
          }

          switch(type) {
            case 'throttle':
              if(!angular.isFunction(throttleCallback)) {
                throttleCallback = libs._.throttle(_invokeCallback, invokeWait, invokeOptions);
              }
              throttleCallback();
              break;
            case 'debounce':
              if(!angular.isFunction(debounceCallback)) {
                debounceCallback = libs._.debounce(_invokeCallback, invokeWait, invokeOptions);
              }
              debounceCallback();
              break;
            default:
              _invokeCallback();
          }
        }


        // _init();
        
      }


      function formFieldLink(scope, element, attrs, formCtrl) {
        var ctrl = scope.formField;
        var templateUrl = ctrl.template;

        // Add parent controller to access it from this controller
        ctrl.formCtrl = formCtrl;

        // Watch selected operator
        var selectedOperatorWatch = scope.$watch('formField.selectedOperator', function(newValue) {
          if(formCtrl && !ctrl.valueOperator) {
            // Add formField if valueOperator not set
            formCtrl.addFormField(scope);
          }

          if(formCtrl) {
            formCtrl.updateFormField(scope.$id, newValue);
          }
        });

        // Watch template
        var templateWatch = scope.$watch('formField.template', function(newValue) {
          templateUrl = newValue;

          ctrl.init();

          if(ctrl.valueOperator) {
            $http.get('app/shared/ui/form/value-operator.html', { cache: $templateCache }).success(function(template) {
              // Replace guhFormField-directive with proper HTML input
              element.html(template);
              $compile(element.contents())(scope);
            });
          } else {
            if(angular.isString(templateUrl)) {
              $http.get(templateUrl, { cache: $templateCache }).success(function(template) {
                // Replace guhFormField-directive with proper HTML input
                element.html(template);
                $compile(element.contents())(scope);
              });
            } else {
              $log.error('guh.ui.guhFormField:directive', 'TemplateURL is not set.');
            }
          }
        });

        // Watch state
        if(scope && angular.isDefined(scope.formField.state)) {
          scope.formField.state.on('DS.change', function() {
            scope.formField.value = scope.formField.state.value;
            scope.$apply();
          });
        }

        // On destroy
        scope.$on('$destroy', function() {
          // Remove previously added formFields
          if(formCtrl) {
            formCtrl.removeFormField(scope);
          }

          // Remove bindings
          // Link: http://angular-tips.com/blog/2013/08/removing-the-unneeded-watches/
          // Link: http://api.jquery.com/off/
          selectedOperatorWatch();
          templateWatch();

          if(scope && angular.isDefined(scope.formField.state)) {
            scope.formField.state.off();
          }

          scope = null;

          element.remove();
          element = null;
        });
      }
    }

}());