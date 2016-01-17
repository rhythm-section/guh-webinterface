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
    .directive('guhWizard', wizardDirective);

  wizardDirective.$inject = ['$log', '$q', '$animate', 'libs', 'wizardService'];

  function wizardDirective($log, $q, $animate, libs, wizardService) {

    var directive = {
      bindToController: {
        handle: '@',
        showNavigation: '=',
        showNext: '=',
        showPrev: '='
      },
      controller: wizardCtrl,
      controllerAs: 'wizard',
      link: wizardLink,
      restrict: 'A',
      scope: {},
      templateUrl: 'app/shared/ui/wizard/wizard.html',
      transclude: true
    };

    return directive;


    function wizardCtrl($scope, $element) {

      /* jshint validthis: true */
      var vm = this;
      var currentStep;
      var nextStep;

      // Public variables
      vm.steps = [];

      // Public methods
      vm.init = init;
      vm.setNavigation = setNavigation;
      vm.addStep = addStep;
      vm.prev = prev;
      vm.next = next;
      vm.goToStep = goToStep;
      vm.hasPrev = hasPrev;
      vm.hasNext = hasNext;
      vm.isActive = isActive;
      vm.isValid = isValid;


      function init() {
        currentStep = 0;

        if(vm.steps.length > 0) {
          vm.steps[currentStep].element.addClass('wizard__step_current');
        }

        vm.title = vm.steps[currentStep].scope.wizardStep.title;
      }

      function setNavigation(navigation) {
        vm.navigation = navigation;
      }

      function addStep(step) {
        vm.steps.push(step);
      }

      function hasPrev() {
        return currentStep > 0;
      }

      function hasNext() {
        return currentStep < (vm.steps.length - 1);
      }

      function prev() {
        if(hasPrev()) {
          vm.steps[currentStep].element.removeClass('wizard__step_current');
          vm.steps[currentStep - 1].element.addClass('wizard__step_current');
          // $animate
          //   .removeClass(vm.steps[currentStep].element, 'current');

          // $animate
          //   .addClass(vm.steps[currentStep - 1].element, 'current');

          vm.title = vm.steps[currentStep - 1].scope.wizardStep.title;

          currentStep = currentStep - 1;
        }
      }

      function next() {
        if(hasNext() && isValid(currentStep + 1)) {
          vm.steps[currentStep].element.removeClass('wizard__step_current');
          vm.steps[currentStep + 1].element.addClass('wizard__step_current');
          // $animate
          //   .addClass(vm.steps[currentStep].element, 'slide-out-left')
          //   .then(function() {
          //     $log.log('END OF ANIMATION', vm.steps[currentStep].element);
          //     // vm.steps[currentStep].element.removeClass('slide-out-left');
          //     // vm.steps[currentStep].element.addClass('hide');

              vm.title = vm.steps[currentStep + 1].scope.wizardStep.title;

              currentStep = currentStep + 1;
            // });

          // $animate.addClass(vm.steps[currentStep + 1].element, 'slide-in-left');

          
        }
      }

      function goToStep(step) {
        var step = step - 1;

        if(step === currentStep) {
          return;
        } else if(currentStep >= 0 && step <= vm.steps.length && isValid(step)) {
          vm.steps[currentStep].element.removeClass('wizard__step_current');
          currentStep = step;
        }

        vm.steps[currentStep].element.addClass('wizard__step_current');
        vm.title = vm.steps[currentStep].scope.wizardStep.title;
      }

      function isActive(step) {
        return currentStep === libs._.findIndex(vm.steps, step);
      }

      function isValid(nextStep) {
        var isValid = false;
        var validCallback = vm.steps[currentStep].ctrl.validCallback;

        // If no isValid-Callback defined user can go
        // Is there a better way to check if the passed attribute is 'undefined'? (http://stackoverflow.com/questions/21935099/how-to-check-if-a-method-argument-of-a-directive-is-specified-in-angularjs)
        if(angular.isUndefined(vm.steps[currentStep].attributes.isValid)) {
          return true;
        }

        if(angular.isFunction(validCallback)) {
          return validCallback();
        }

        $log.error('guh.ui.directive:guhWizard', 'The value of "is-valid" has to be a function.');
        return false;
      }

    }

    function wizardLink(scope, element, attrs, wizardCtrl) {

      function _init() {
        $log.log('WIZARD');

        // Add proper styles
        element.addClass('wizard');

        if(wizardCtrl.showNavigation) {
          element.addClass('wizard_show_navigation');
        }

        // Save handle for later retrieval
        wizardService.addHandle(scope);

        // Initialize controller
        wizardCtrl.init();
      }

      // Go to previous step
      scope.$on('wizard.prev', function(event, handle) {
        if(handle === wizardCtrl.handle) {
          wizardService.getByHandle(handle).wizard.prev();
        }
      });

      // Go to next step
      scope.$on('wizard.next', function(event, handle) {
        if(handle === wizardCtrl.handle) {
          wizardService.getByHandle(handle).wizard.next();
        }
      });

      // Go to certain step
      scope.$on('wizard.goToStep', function(event, handle, step) {
        if(handle === wizardCtrl.handle) {
          wizardService.getByHandle(handle).wizard.goToStep(step);
        }
      });


      _init();

    }
  }

}());