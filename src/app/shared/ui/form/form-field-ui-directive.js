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

    guhFormField.$inject = ['$log', '$http', '$compile', 'libs'];

    function guhFormField($log, $http, $compile, libs) {
      var directive = {
        bindToController: {
          changeCallback: '&onValueChange',
          label: '@',
          name: '@',
          paramType: '=',
          required: '@',
          state: '=',
          template: '@'
        },
        controller: formFieldCtrl,
        controllerAs: 'formField',
        link: formFieldLink,
        require: '?^^guhForm',
        restrict: 'E',
        scope: {}
      };

      return directive;


      function formFieldCtrl($attrs) {
        
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

        vm.setValue = setValue;


        /*
         * Private methods
         */

        function _init() {
          _setDefaults();

          // $log.log(vm.label, vm.name);
          // $log.log('vm.template', vm.template);
          // $log.log('vm.value', vm.value);
          // $log.log('--------------------');

          // _setInitialValue();
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
              // $log.log('RANGE', value);
              break;
            case 'select':
              // value = ['no options'];
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
            // vm.value = (angular.isDefined(vm.state.defaultValue) && vm.state.defaultValue !== null) ? vm.state.defaultValue : _getDefault(vm.state.type);
            if(angular.isDefined(vm.state.value) && vm.state.value !== null) {
              vm.value = vm.state.value;
            } else if(angular.isDefined(vm.state.defaultValue) && vm.state.defaultValue !== null) {
              vm.value = vm.state.defaultValue;
            } else {
              vm.value = _getDefault(vm.state.type);
            }

            // $log.log('Set default with state.', vm.state);
          } else if(angular.isDefined(vm.template) && vm.template !== '') {
            var filename = vm.template.substring(vm.template.lastIndexOf('/') + 1, vm.template.lastIndexOf('.'));
            var type = filename.replace('form-field-', '');

            vm.value = _getDefault(type);
            // $log.log('Set default with switch.', type);
          }

          // ParamType
          if(angular.isDefined(vm.paramType)) {
            // Unit
            vm.unit = vm.paramType.unit ? vm.paramType.unit : undefined;
          }

          // $log.log('unit', vm.unit);
        }

        // function _setInitialValue() {
        //   if(angular.isDefined(vm.state) && vm.state !== null) {
        //     // vm.value = vm.state;
        //     // $log.log('vm.state', vm.state, (typeof vm.state));

        //     vm.value = vm.state.defaultValue ? vm.state.defaultValue : _getDefault(vm.state.type);
        //     $log.log(vm.value);
        //   } else {
        //     $log.log('vm.state', vm.state);
        //   }
        // }

        function _invokeCallback() {
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

        function setValue(type, wait, options) {
          var invokeWait;
          var invokeOptions;

          if(typeof wait !== 'undefined') {
            invokeWait = wait || 0;
          }

          if(typeof options !== 'undefined') {
            invokeOptions = {
              leading: options.leading || false,
              trailing: options.trailing || true
            };

            if(typeof type !== 'undefined' && type === 'throttle') {
              invokeOptions.maxWait = options.maxWait || invokeWait;
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


        _init();
        
      }


      function formFieldLink(scope, element, attrs, formCtrl) {
        var ctrl = scope.formField;
        var templateUrl = ctrl.template;

        // Parent form is optional
        if(formCtrl) {
          formCtrl.addFormField(scope);
        }

        // Get template
        if(angular.isString(templateUrl)) {
          $http.get(templateUrl).success(function(template) {
            // Replace guhFormField-directive with proper HTML input
            element.html(template);
            $compile(element.contents())(scope);
          });
        } else {
          $log.error('guh.ui.guhFormField:directive', 'TemplateURL is not set.');
        }
      }
    }

}());