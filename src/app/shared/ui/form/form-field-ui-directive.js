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

    guhFormField.$inject = ['libs', 'app', '$log', '$templateRequest', '$compile', 'DSState'];

    function guhFormField(libs, app, $log, $templateRequest, $compile, DSState) {
      var directive = {
        bindToController: {
          changeCallback: '&onValueChange',
          label: '@',
          name: '@',
          paramType: '=',
          placeholder: '@',
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
        require: ['guhFormField', '?^^guhForm'],
        restrict: 'E',
        scope: {}
      };

      return directive;


      function formFieldCtrl($scope, $element, $attrs) {

        /* jshint validthis: true */
        var vm = this;
        var throttleCallback = null;
        var debounceCallback = null;

        vm.availableValueOperators = [];
        vm.selectedValueOperator = app.valueOperator.is;
        vm.is = null;
        vm.from = null;
        vm.to = null;

        vm.init = init;
        vm.setValueOperators = setValueOperators;
        vm.selectValueOperator = selectValueOperator;
        vm.setValue = setValue;


        function _setDefaults() {
          // State
          if(angular.isDefined(vm.state) && vm.state !== null) {
            // Value
            if(angular.isDefined(vm.state.value) && vm.state.value !== null) {
              vm.value = vm.state.value;
            } else if(angular.isDefined(vm.state.defaultValue) && vm.state.defaultValue !== null) {
              vm.value = vm.state.defaultValue;
            } else {
              vm.value = _getDefault(vm.state.type);
            }

            // Placeholder
            vm.placeholder = _getDefault(vm.state.type);
          } else if(angular.isDefined(vm.template) && vm.template !== '') {
            var filename = vm.template.substring(vm.template.lastIndexOf('/') + 1, vm.template.lastIndexOf('.'));
            var type = filename.replace('form-field-', '');

            // Value
            vm.value = _getDefault(type);

            // Placeholder
            vm.placeholder = _getDefault(type);
          }

          // StateType
          if(angular.isDefined(vm.stateType) && vm.stateType !== null) {
            // Min & max value
            vm.minValue = vm.stateType.minValue ? vm.stateType.minValue : 0;
            vm.maxValue = vm.stateType.maxValue ? vm.stateType.maxValue : 100;

            // Select options
            vm.selectOptions = vm.stateType.possibleValues ? vm.stateType.possibleValues : [];

            // Unit
            vm.unit = vm.stateType.unit ? app.unit[vm.stateType.unit] : undefined;
          }

          // ParamType
          if(angular.isDefined(vm.paramType)) {
            // Min & max value
            vm.minValue = vm.paramType.minValue ? vm.paramType.minValue : 0;
            vm.maxValue = vm.paramType.maxValue ? vm.paramType.maxValue : 100;

            // Select options
            vm.selectOptions = vm.paramType.allowedValues ? vm.paramType.allowedValues : [];

            // Unit
            vm.unit = vm.paramType.unit ? app.unit[vm.paramType.unit] : undefined;
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
            case 'search':
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
              value = '';
              break;
            default:
              value = '';
              break;
          }

          return value;
        }

        function setValueOperators() {
          var type = '';

          if(angular.isDefined(vm.paramType)) {
            type = vm.paramType.type;
          } else if(angular.isDefined(vm.stateType)) {
            type = vm.stateType.type;
          }

          switch(type) {
            case 'Bool':
              vm.availableValueOperators = [
                app.valueOperator.is
              ];
              break;
            case 'String':
              vm.availableValueOperators = [
                app.valueOperator.is
              ];
              break;
            case 'Int':
            case 'Uint':
            case 'Double':
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
          // Invoke callback function only if defined (if not defined, params can be passed to callback inside guh-form)
          if(angular.isFunction(vm.changeCallback)) {
            if(vm.value === '') {
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


        function init() {
          // Set default values and placholder text
          _setDefaults();
          vm.setValueOperators();

          // if(vm.valueOperator) {
          //   vm.selectValueOperator();
          //   vm.setValueOperators();
          // }

          // If current formfield is the valueoperator
          if(vm.valueOperator) {
            vm.is = app.valueOperator.is;
            vm.is.paramType = vm.paramType;
            vm.is.stateType = vm.stateType;

            if(vm.selectedValueOperator) {
              // Reset
              if(angular.toJson(vm.selectedValueOperator) !== angular.toJson(app.valueOperator.is)) {
                vm.selectedValueOperator = app.valueOperator.is;
              }

              vm.selectedOperator = vm.selectedValueOperator.operators[0];
              vm.selectValueOperator();
            }
          }
        };

        function selectValueOperator() {
          // Reset
          vm.is = null;
          vm.from = null;
          vm.to = null;

          if(angular.toJson(vm.selectedValueOperator) === angular.toJson(app.valueOperator.between)) {
            vm.is = null;

            vm.from = vm.selectedValueOperator;
            vm.from.paramType = vm.paramType ? vm.paramType : undefined;
            vm.from.stateType = vm.stateType ? vm.stateType : undefined;
            vm.from.operator = vm.selectedValueOperator.operators[0];

            vm.to = vm.selectedValueOperator;
            vm.to.paramType = vm.paramType ? vm.paramType : undefined;
            vm.to.stateType = vm.stateType ? vm.stateType : undefined;
            vm.to.operator = vm.selectedValueOperator.operators[1];
          } else {
            vm.is = angular.copy(vm.selectedValueOperator);
            vm.is.paramType = vm.paramType ? vm.paramType : undefined;
            vm.is.stateType = vm.stateType ? vm.stateType : undefined;
            vm.is.operator = vm.selectedValueOperator.operators[0];

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
      }


      function formFieldLink(scope, element, attrs, formCtrls) {
        var formFieldCtrl = formCtrls[0] || null;
        var formCtrl = formCtrls[1] || null;
        var previousScope = null;

        // Get template via $http or $templateCache and append it to the guh-form-field element. After that link and compile the template to get updated data.
        function setTemplate(template) {
          // If value-operator was set to true, ignore the passed template and append a select field which is then responsible for showing the correct guh-form-fields.
          var templateUrl = attrs.valueOperator ? app.basePaths.ui + 'form/value-operator.html' : template;
          
          if(angular.isString(templateUrl) && templateUrl !== '') {
            $templateRequest(templateUrl, true)
              .then(function(template) {
                // Destroy previous scope to avoid memory leak
                if(previousScope) {
                  if(formCtrl) {
                    formCtrl.removeFormField(previousScope);
                  }

                  previousScope.$destroy();
                  previousScope = null;
                }

                previousScope = scope.$new();

                if(previousScope && formCtrl && !formFieldCtrl.valueOperator) {
                  formCtrl.addFormField(previousScope);
                }

                element.html(template);
                $compile(element.contents())(previousScope);

                // Initialize formfield
                if(formFieldCtrl) {
                  formFieldCtrl.init();
                }
              })
              .catch(function(error) {
                $log.error('guh.ui.directive:formField', error);
              });
          } else {
            $log.error('guh.ui.directive:formField', 'No template has been specified or the specified template is not of type "String".');
          }
        }

        // Observes
        attrs.$observe('template', function(template) {
          setTemplate(template);
        });


        // Cleanup
        scope.$on('$destroy', function() {
          if(previousScope) {
            if(formCtrl) {
              formCtrl.removeFormField(previousScope);
            }

            previousScope.$destroy();
            previousScope = null;
          }
        });
      }
    }

}());