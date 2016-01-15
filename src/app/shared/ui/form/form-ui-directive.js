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
    .directive('guhForm', guhForm);

    guhForm.$inject = ['$log', 'libs'];

    function guhForm($log, libs) {
      var directive = {
        bindToController: {
          name: '@',
          submitCallback: '&onFormSubmit',
        },
        controller: formCtrl,
        controllerAs: 'form',
        link: formLink,
        restrict: 'E',
        scope: {},
        templateUrl: 'app/shared/ui/form/form.html',
        transclude: true
      };

      return directive;


      function formCtrl($scope) {
        
        /*
         * Variables
         */

        /* jshint validthis: true */
        var vm = this;
        vm.formFields = [];


        /*
         * API
         */

        vm.addFormField = addFormField;
        vm.removeFormField = removeFormField;
        vm.updateFormField = updateFormField;
        vm.setFormField = setFormField;
        vm.submit = submit;


        /*
         * Private methods
         */

        /*
         * Public methods
         */

        function addFormField(formFieldScope) {
          vm.formFields.push(formFieldScope);
        }

        function removeFormField(formFieldScope) {
          var remainingFormFields = [];

          angular.forEach(vm.formFields, function(formField) {
            if(formField.$id !== formFieldScope.$id) {
              remainingFormFields.push(formField);
            }
          });

          vm.formFields = remainingFormFields;
          
          // vm.formFields = vm.formFields.filter(function(formField) {
          //   $log.log('formField.$id', formField.$id);
          //   $log.log('formFieldScope.$id', formFieldScope.$id);
          //   return formField.$id === formFieldScope.$id;
          // });
        }

        function updateFormField(formFieldScopeId, selectedOperator) {
          if(angular.isDefined(formFieldScopeId) && angular.isDefined(selectedOperator)) {
            var index = libs._.findIndex(vm.formFields, { '$id': formFieldScopeId });

            if(index !== -1) {
              vm.formFields[index].selectedOperator = selectedOperator;
            }
          }
        }

        function setFormField(formFieldScope) {
          var index = libs._.findIndex(vm.formFields, { '$id': formFieldScope.$id });

          if(index === -1) {
            // Add
            vm.formFields.push(formFieldScope);
          } else {
            // Update if already there
            vm.formFields[index] = formFieldScope;
          }
        }

        function submit() {
          // Check if form is valid
          if($scope[vm.name].$valid) {
            var params = [];

            angular.forEach(vm.formFields, function(scope) {
              params.push({
                name: scope.formField.name,
                value: scope.formField.value
              });
            });

            // TODO: Validation
            vm.submitCallback({
              params: params
            });
          } else {
            $log.log('guh.ui.directive:guhForm', 'Form is not valid.');
          }
        }
        
      }


      function formLink(scope, elem, attrs, formCtrl) {
        /* jshint unused: false */

        // On destroy
        scope.$on('$destroy', function() {
          // Destroy appended guh-form-fields
          angular.forEach(formCtrl.formFields, function(formFieldScope) {
            formFieldScope.$destroy();
            formFieldScope = null;
          });
        });
      }
    }

}());